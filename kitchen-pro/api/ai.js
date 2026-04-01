const GROQ_KEY = process.env.GROQ_API_KEY || "";
const MODEL = "llama-3.1-8b-instant";

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
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({ model: MODEL, messages: groqMessages, max_tokens: maxTokens, temperature: 0.1 }),
    });

    const data = await upstream.json();
    console.log("Groq status:", upstream.status, "error:", data?.error?.message || "none");

    if (!upstream.ok || data?.error) {
      return res.status(500).json({ error: data?.error?.message || `Groq error ${upstream.status}` });
    }

    let text = data.choices?.[0]?.message?.content || "";
    // Estrai JSON se presente nel testo
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];
    // Rimuovi markdown
    text = text.replace(/^```(?:json)?
?/, "").replace(/
?```$/, "").trim();
    return res.status(200).json({ content: [{ type: "text", text }], role: "assistant" });
  } catch (e) {
    console.error("Proxy error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}
