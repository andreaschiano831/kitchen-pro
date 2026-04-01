const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-2.0-flash-lite";

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
    const wantsJSON = systemText.includes("JSON") || systemText.includes("json");

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

    const hasPDF = parts.some(p => p.inline_data?.mime_type === "application/pdf");

    const geminiBody = {
      system_instruction: systemText ? { parts: [{ text: systemText }] } : undefined,
      contents: [{ role: "user", parts }],
      generationConfig: {
        maxOutputTokens: Math.min(maxTokens, 8192),
        temperature: 0.1,
        ...(wantsJSON && !hasPDF ? { responseMimeType: "application/json" } : {}),
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
      console.error("Gemini error:", JSON.stringify(data?.error));
      // Quota esaurita — messaggio chiaro
      if (data?.error?.code === 429) {
        return res.status(429).json({ error: "Quota giornaliera Gemini esaurita. Riprova domani o vai su aistudio.google.com per aumentare il limite." });
      }
      return res.status(500).json({ error: msg });
    }

    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) return res.status(500).json({ error: "Risposta vuota da Gemini." });
    if (wantsJSON) text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();

    return res.status(200).json({
      content: [{ type: "text", text }],
      id: "gemini-proxy", model: MODEL, role: "assistant",
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
