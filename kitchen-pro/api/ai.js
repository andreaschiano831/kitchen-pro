const GROQ_KEY = process.env.GROQ_API_KEY || "";
const MODEL = "llama-3.1-8b-instant";

function extractJSON(text) {
  // Trova il primo { e traccia le parentesi per trovare il JSON completo
  const start = text.indexOf("{");
  if (start === -1) return text;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") { depth--; if (depth === 0) return text.slice(start, i + 1); }
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
    const groqMessages = [];
    if (systemText) groqMessages.push({ role: "system", content: systemText });
    if (messages.length > 0) {
      const content = messages[0].content;
      let textContent = "";
      if (Array.isArray(content)) {
        textContent = content.filter(p => p.type === "text").map(p => p.text).join("\n");
      } else if (typeof content === "string") {
        textContent = content;
      }
      groqMessages.push({ role: "user", content: textContent || "Analizza e rispondi." });
    } else {
      groqMessages.push({ role: "user", content: "Analizza e rispondi." });
    }
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model: MODEL, messages: groqMessages, max_tokens: maxTokens, temperature: 0.1 }),
    });
    const data = await upstream.json();
    if (!upstream.ok || data?.error) {
      return res.status(500).json({ error: data?.error?.message || `Groq error ${upstream.status}` });
    }
    let text = data.choices?.[0]?.message?.content || "";
    if (!text) return res.status(500).json({ error: "Risposta vuota" });
    // Estrai JSON con parser bilanciato
    text = extractJSON(text);
    return res.status(200).json({ content: [{ type: "text", text }], role: "assistant" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
