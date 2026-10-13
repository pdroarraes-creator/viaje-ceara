// Síntesis de voz con Gemini TTS (la usan el estudio de voz de /admin y las respuestas en audio de los bots).
export async function synth(env, voice, text, style) {
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
