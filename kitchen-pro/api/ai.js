const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-1.5-flash";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_API_KEY non configurata su Vercel" });

  try {
    const body = req.body;
    const systemText = body.system || "";
    const messages = body.messages || [];
    const maxTokens = body.max_tokens || 1024;

    // Detect se la risposta deve essere JSON
    const wantsJSON = systemText.includes("JSON") || systemText.includes("json") ||
      (messages[0]?.content && typeof messages[0].content === "string" &&
       messages[0].content.includes("JSON"));

    // Traduci content Claude → parts Gemini
    let parts = [];
    if (messages.length > 0) {
      const content = messages[0].content;
      if (Array.isArray(content)) {
        for (const p of content) {
          if (p.type === "text") parts.push({ text: p.text });
          else if (p.type === "image" && p.source?.type === "base64")
            parts.push({ inline_data: { mime_type: p.source.media_type, data: p.source.data } });
        }
      } else if (typeof content === "string") {
        parts.push({ text: content });
      }
    }
    if (!parts.length) parts = [{ text: "Analizza e rispondi." }];

    const geminiBody = {
      system_instruction: systemText ? { parts: [{ text: systemText }] } : undefined,
      contents: [{ role: "user", parts }],
      generationConfig: {
        maxOutputTokens: Math.min(maxTokens, 8192),
        temperature: 0.2,
        ...(wantsJSON ? { responseMimeType: "application/json" } : {}),
      },
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    const data = await upstream.json();

    if (!upstream.ok || data?.error) {
      const msg = data?.error?.message || `Gemini error ${upstream.status}`;
      console.error("Gemini error:", msg);
      return res.status(500).json({ error: msg });
    }

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Pulizia markdown se Gemini wrappa il JSON
    if (wantsJSON) text = text.replace(/^```(?:json)?\n?/,"").replace(/\n?```$/,"").trim();

    return res.status(200).json({
      content: [{ type: "text", text }],
      id: "gemini-proxy", model: MODEL, role: "assistant",
    });
  } catch (e) {
    console.error("Proxy error:", e);
    return res.status(500).json({ error: e.message });
  }
}
