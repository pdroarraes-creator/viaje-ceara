// Bot de WhatsApp (ruta no oficial: dispositivo vinculado). Uso:  node index.js caju   |   node index.js castanha
// Variables: WORKER_URL, BOT_KEY, y para la primera vinculación PHONE=5491100000000 (el número del bot, sin +).
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import pino from "pino";
import { shouldReply, cleanText, typingMs } from "./logic.js";

const bot = process.argv[2];
if (!["caju", "castanha"].includes(bot)) { console.log("Uso: node index.js caju|castanha"); process.exit(1); }
const { WORKER_URL, BOT_KEY, PHONE } = process.env;
if (!WORKER_URL || !BOT_KEY) { console.log("Faltan WORKER_URL y BOT_KEY"); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
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
    if (type !== "notify") return;
    for (const msg of messages) {
      try {
        const jid = msg.key.remoteJid || "";
        if (!msg.message || jid.endsWith("@broadcast") || jid === "status@broadcast") continue;
        const isGroup = jid.endsWith("@g.us");
        const ctx = msg.message.extendedTextMessage?.contextInfo;
        const me = (sock.user?.id || "").split(":")[0].split("@")[0];
        const text = textOf(msg.message);
        const m = {
          isGroup, text, fromMe: !!msg.key.fromMe,
          mentionedMe: !!ctx?.mentionedJid?.some(j => j.split("@")[0] === me),
          repliedToMe: !!ctx?.participant && ctx.participant.split("@")[0] === me,
        };
        if (!shouldReply(bot, m)) continue;
        const sender = (isGroup ? msg.key.participant : jid) || "";
        const r = await fetch(WORKER_URL.replace(/\/$/, "") + "/bot", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ botKey: BOT_KEY, bot, from: sender.split("@")[0], name: msg.pushName || "", chat: jid, text: cleanText(text, bot) }),
        });
        const d = await r.json().catch(() => ({}));
        if (!d.reply) continue;
        await sock.readMessages([msg.key]);
        await sock.sendPresenceUpdate("composing", jid);
        await sleep(typingMs(d.reply));
        await sock.sendMessage(jid, { text: d.reply }, { quoted: isGroup ? msg : undefined });
        await sock.sendPresenceUpdate("paused", jid);
      } catch (e) { console.log("error", e.message); }
    }
  });
}
start();
