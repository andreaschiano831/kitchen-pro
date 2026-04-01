const GROQ_KEY = process.env.GROQ_API_KEY || "";
const MODEL = "llama-3.1-8b-instant";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!GROQ_KEY) return res.status(500).json({ error: "GROQ_API_KEY non configurata su Vercel" });

  try {
    const body = req.body;
    const systemText = body.system || "";
    const messages = body.messages || [];
    const maxTokens = body.max_tokens || 1024;

    // Costruisci messaggi Groq (formato OpenAI)
    const groqMessages = [];
    if (systemText) groqMessages.push({ role: "system", content: systemText });
    
    if (messages.length > 0) {
      const content = messages[0].content;
      if (Array.isArray(content)) {
        // Multimodale: estrai solo testo (Groq non supporta immagini su llama)
        const textParts = content.filter(p => p.type === "text").map(p => p.text).join("\n");
        const imgParts = content.filter(p => p.type === "image");
        if (imgParts.length > 0) {
          // Per immagini usa llama-3.2-11b-vision-preview
          const visionMessages = [...groqMessages];
          visionMessages.push({ role: "user", content });
          const vRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
            body: JSON.stringify({ model: "llama-3.2-11b-vision-preview", messages: visionMessages, max_tokens: Math.min(maxTokens, 8192), temperature: 0.1 }),
          });
          const vData = await vRes.json();
          if (!vRes.ok) return res.status(500).json({ error: vData?.error?.message || "Groq error" });
          const text = vData.choices?.[0]?.message?.content || "";
          return res.status(200).json({ content: [{ type: "text", text }], role: "assistant" });
        }
        groqMessages.push({ role: "user", content: textParts });
      } else {
        groqMessages.push({ role: "user", content: typeof content === "string" ? content : "Analizza e rispondi." });
      }
    }

    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({ model: MODEL, messages: groqMessages, max_tokens: Math.min(maxTokens, 8192), temperature: 0.1 }),
    });

    const data = await upstream.json();
    if (!upstream.ok || data?.error) return res.status(500).json({ error: data?.error?.message || `Groq error ${upstream.status}` });

    const text = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ content: [{ type: "text", text }], role: "assistant" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
