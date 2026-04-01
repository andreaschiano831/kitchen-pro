const GROQ_KEY = process.env.GROQ_API_KEY || "";

function extractJSON(text) {
  const start = text.indexOf("{");
  if (start === -1) return text;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") { depth--; if (depth === 0) return text.slice(start, i+1); }
  }
  return text.slice(start);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!GROQ_KEY) return res.status(500).json({ error: "GROQ_API_KEY mancante" });
  try {
    const body = req.body;
    const systemText = body.system || "";
    const messages = body.messages || [];
    const maxTokens = Math.min(body.max_tokens || 1024, 8192);

    // Controlla se ci sono immagini
    const content = messages[0]?.content;
    const hasImage = Array.isArray(content) && content.some(p => p.type === "image");

    const groqMessages = [];
    if (systemText) groqMessages.push({ role: "system", content: systemText });

    if (hasImage && Array.isArray(content)) {
      // Usa modello vision per immagini
      const visionContent = content.map(p => {
        if (p.type === "text") return { type: "text", text: p.text };
        if (p.type === "image") return {
          type: "image_url",
          image_url: { url: `data:${p.source.media_type};base64,${p.source.data}` }
        };
        return null;
      }).filter(Boolean);
      groqMessages.push({ role: "user", content: visionContent });
    } else {
      let textContent = "";
      if (Array.isArray(content)) {
        textContent = content.filter(p => p.type === "text").map(p => p.text).join("\n");
      } else if (typeof content === "string") {
        textContent = content;
      }
      groqMessages.push({ role: "user", content: textContent || "Analizza e rispondi." });
    }

    const model = hasImage ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";

    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model, messages: groqMessages, max_tokens: maxTokens, temperature: 0.1 }),
    });

    const data = await upstream.json();
    console.log("Groq status:", upstream.status, "model:", model);
    if (!upstream.ok || data?.error) {
      return res.status(500).json({ error: data?.error?.message || `Groq error ${upstream.status}` });
    }
    let text = data.choices?.[0]?.message?.content || "";
    if (!text) return res.status(500).json({ error: "Risposta vuota" });
    text = extractJSON(text);
    return res.status(200).json({ content: [{ type: "text", text }], role: "assistant" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
