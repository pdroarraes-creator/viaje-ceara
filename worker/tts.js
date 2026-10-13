// Síntesis de voz con Gemini TTS (la usan el estudio de voz de /admin y las respuestas en audio de los bots).
// Teto diário de sínteses (estúdio de voz + bots), para um erro ou abuso não esvaziar o saldo. Variável opcional TTS_PER_DAY.
const TTS_PER_DAY = 150;

export async function synth(env, voice, text, style) {
  if (env.QA) {
    const limit = Number(env.TTS_PER_DAY) || TTS_PER_DAY;
    const k = `ttsday:${new Date().toISOString().slice(0, 10)}`;
    const n = Number(await env.QA.get(k)) || 0;
    if (n >= limit) throw Object.assign(new Error("daily_limit"), { status: 429 });
    await env.QA.put(k, String(n + 1), { expirationTtl: 90000 });
  }
  const G = "https://generativelanguage.googleapis.com/v1beta";
  const ann = style ? [{ type: "speech_metadata", style: String(style).slice(0, 200) }] : undefined;
  const req = {
    model: String(env.TTS_MODEL || "gemini-3.8-flash-tts"),
    input: [{ type: "user_input", content: [{ type: "text", text: String(text).slice(0, 1200), ...(ann ? { annotations: ann } : {}) }] }],
    response_format: { type: "audio" },
    generation_config: { speech_config: [{ voice: String(voice) }] },
  };
  const r = await fetch(`${G}/interactions`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY }, body: JSON.stringify(req) });
  const t = await r.text();
  if (!r.ok) throw Object.assign(new Error("upstream"), { status: r.status, detail: t.slice(0, 600) });
  let d; try { d = JSON.parse(t); } catch { throw new Error("bad_upstream"); }
  let audio = null;
  for (const st of d.steps || []) if (st.type === "model_output") for (const c of st.content || []) if (c.type === "audio" && c.data) audio = c.data;
  if (!audio) throw Object.assign(new Error("no_audio"), { detail: t.slice(0, 400) });
  return audio;
}
