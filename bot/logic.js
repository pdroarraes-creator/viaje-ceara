// Reglas puras (sin WhatsApp) para decidir si el bot responde. Se pueden probar solas.
export const NAMES = { caju: ["caju"], castanha: ["castanha", "castaña", "castana"] };

const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// m: { isGroup, text, mentionedMe, repliedToMe, fromMe }
export function shouldReply(bot, m) {
  if (m.fromMe) return false;
  if (m.hasAudio) return !m.isGroup || !!(m.mentionedMe || m.repliedToMe); // áudio no grupo: só se respondem a ela (não dá pra ler o nome)
  if (!m.text || !m.text.trim()) return false;
  if (!m.isGroup) return true; // en privado responde siempre (el permiso lo decide el servidor)
  if (m.mentionedMe || m.repliedToMe) return true;
  const t = norm(m.text);
  return NAMES[bot].some(n => new RegExp(`(^|[^a-z])${norm(n)}([^a-z]|$)`).test(t)); // "caju, ..." / "che castanha"
}

export function cleanText(text, bot) {
  let t = String(text || "");
  for (const n of NAMES[bot]) t = t.replace(new RegExp(`@?${n}`, "ig"), "");
  return t.replace(/^[\s,:;-]+/, "").trim() || text;
}

// pausa humana: entre 2 y 6 segundos según el largo de la respuesta
export const typingMs = reply => Math.min(6000, 2000 + reply.length * 25);
