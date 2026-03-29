const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_API_KEY non configurata" });
  try {
    const body = req.body;
    const systemText = body.system || "";
    const messages = body.messages || [];

    // Traduci content Claude → parts Gemini (supporta testo + immagini)
    let parts = [];
    if (messages.length > 0) {
      const content = messages[0].content;
      if (Array.isArray(content)) {
        for (const p of content) {
          if (p.type === "text") {
            parts.push({ text: p.text });
          } else if (p.type === "image" && p.source?.type === "base64") {
            parts.push({ inline_data: { mime_type: p.source.media_type, data: p.source.data } });
          }
        }
      } else if (typeof content === "string") {
        parts.push({ text: content });
      }
    }
    if (!parts.length) parts = [{ text: "Analizza e rispondi." }];

    const geminiBody = {
      system_instruction: systemText ? { parts: [{ text: systemText }] } : undefined,
      contents: [{ role: "user", parts }],
      generationConfig: { maxOutputTokens: body.max_tokens || 1024, temperature: 0.3 },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });
    const data = await upstream.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text && data?.error) return res.status(500).json({ error: data.error.message });
    return res.status(200).json({
      content: [{ type: "text", text }],
      id: "gemini-proxy", model: "gemini-2.0-flash", role: "assistant",
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
