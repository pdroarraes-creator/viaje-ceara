// Bot de WhatsApp (ruta no oficial: dispositivo vinculado). Uso:  node index.js caju   |   node index.js castanha
// Variables: WORKER_URL, BOT_KEY, y para la primera vinculación PHONE=5491100000000 (el número del bot, sin +).
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadMediaMessage } from "@whiskeysockets/baileys";
import pino from "pino";
import { spawn } from "node:child_process";
import { shouldReply, cleanText, typingMs } from "./logic.js";

const bot = process.argv[2];
if (!["caju", "castanha"].includes(bot)) { console.log("Uso: node index.js caju|castanha"); process.exit(1); }
const { WORKER_URL, BOT_KEY, PHONE } = process.env;
if (!WORKER_URL || !BOT_KEY) { console.log("Faltan WORKER_URL y BOT_KEY"); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Convierte el audio de Gemini (WAV o PCM crudo de 24 kHz) a nota de voz de WhatsApp (ogg/opus). Necesita ffmpeg; si falta, devuelve null y se manda texto.
function toVoiceNote(b64) {
  return new Promise(resolve => {
    const raw = Buffer.from(b64, "base64");
    const isWav = raw.slice(0, 4).toString() === "RIFF";
    const args = ["-loglevel", "error", ...(isWav ? [] : ["-f", "s16le", "-ar", "24000", "-ac", "1"]), "-i", "pipe:0", "-c:a", "libopus", "-b:a", "32k", "-ac", "1", "-ar", "24000", "-f", "ogg", "pipe:1"];
    let p; try { p = spawn("ffmpeg", args); } catch { return resolve(null); }
    const out = []; p.stdout.on("data", c => out.push(c)); p.stderr.on("data", () => {});
    p.on("error", () => resolve(null));
    p.on("close", code => resolve(code === 0 && out.length ? Buffer.concat(out) : null));
    p.stdin.on("error", () => {}); p.stdin.end(raw);
  });
}
const textOf = m => m?.conversation || m?.extendedTextMessage?.text || m?.imageMessage?.caption || "";

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(`auth-${bot}`);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ version, auth: state, logger: pino({ level: "silent" }), markOnlineOnConnect: false, syncFullHistory: false });
  sock.ev.on("creds.update", saveCreds);

  // primera vez: código de 8 letras para vincular desde el propio celular (WhatsApp → Dispositivos vinculados → con número)
  if (!sock.authState.creds.registered) {
    if (!PHONE) { console.log("Primera vez: corré con PHONE=<número del bot sin +>"); process.exit(1); }
    await sleep(3000);
    console.log("Código para vincular", bot + ":", await sock.requestPairingCode(PHONE.replace(/\D/g, "")));
  }

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") console.log(bot, "conectado");
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) { console.log("Sesión cerrada desde el celular. Borrá auth-" + bot + " y vinculá de nuevo."); process.exit(1); }
      setTimeout(start, 5000);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") { console.log("evento ignorado, tipo:", type); return; }
    for (const msg of messages) {
      try {
        const jid = msg.key.remoteJid || "";
        if (!msg.message || jid.endsWith("@broadcast") || jid === "status@broadcast") continue;
        const isGroup = jid.endsWith("@g.us");
        const aud = msg.message.audioMessage;
        const ctx = msg.message.extendedTextMessage?.contextInfo || aud?.contextInfo;
        const me = (sock.user?.id || "").split(":")[0].split("@")[0];
        const text = textOf(msg.message);
        const m = {
          isGroup, text, hasAudio: !!aud && (aud.seconds || 0) <= 180, fromMe: !!msg.key.fromMe,
          mentionedMe: !!ctx?.mentionedJid?.some(j => j.split("@")[0] === me),
          repliedToMe: !!ctx?.participant && ctx.participant.split("@")[0] === me,
        };
        console.log("msg", isGroup ? "grupo" : "privado", [msg.key.senderPn, msg.key.remoteJidAlt, jid].filter(Boolean).map(x => x.split("@")[0]).join("|"), JSON.stringify(aud ? "[áudio " + (aud.seconds || "?") + "s]" : (text || "").slice(0, 40)), m.fromMe ? "(minha)" : "");
        if (!shouldReply(bot, m)) { console.log("  -> ignorada"); continue; }
        // en grupos WhatsApp a veces usa un identificador interno (@lid): preferimos el número real si viene
        const sender = (isGroup ? (msg.key.participantPn || msg.key.participantAlt || msg.key.participant) : (msg.key.senderPn || msg.key.remoteJidAlt || jid)) || "";
        let audio;
        if (m.hasAudio) {
          const buf = await downloadMediaMessage(msg, "buffer", {}, { logger: pino({ level: "silent" }), reuploadRequest: sock.updateMediaMessage });
          audio = { mime: (aud.mimetype || "audio/ogg").split(";")[0], data: buf.toString("base64") };
        }
        const cand = isGroup ? [msg.key.participantPn, msg.key.participantAlt, msg.key.participant] : [msg.key.senderPn, msg.key.remoteJidAlt, jid];
        const ids = [...new Set(cand.filter(Boolean))];
        const r = await fetch(WORKER_URL.replace(/\/$/, "") + "/bot", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ botKey: BOT_KEY, bot, from: sender.split("@")[0], name: msg.pushName || "", chat: jid, text: cleanText(text, bot), audio, wantAudio: !!audio, ids }),
        });
        const d = await r.json().catch(() => ({}));
        console.log("  worker:", r.status, d.reply ? "resposta de " + d.reply.length + " letras" : JSON.stringify(d).slice(0, 160), d.audio ? "+ áudio" : "", d.audioError ? "| ERRO DE VOZ: " + d.audioError : "");
        if (!d.reply) continue;
        await sock.readMessages([msg.key]);
        await sock.sendPresenceUpdate("composing", jid);
        await sleep(d.audio ? 1500 : typingMs(d.reply));
        const note = d.audio ? await toVoiceNote(d.audio) : null;
        if (d.audio && !note) console.log("  (sem ffmpeg ou falha ao converter: mando texto)");
        if (note) await sock.sendMessage(jid, { audio: note, mimetype: "audio/ogg; codecs=opus", ptt: true }, { quoted: isGroup ? msg : undefined });
        else await sock.sendMessage(jid, { text: d.reply }, { quoted: isGroup ? msg : undefined });
        await sock.sendPresenceUpdate("paused", jid);
      } catch (e) { console.log("error", e.message); }
    }
  });
}
start();
