const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_API_KEY non configurata" });
  try {
    const body = req.body;
    // Traduci formato Claude → Gemini
    const systemText = body.system || "";
    const messages = body.messages || [];
    const userContent = messages.length > 0
      ? (Array.isArray(messages[0].content)
          ? messages[0].content.map(p => p.text || "").join("\n")
          : messages[0].content || "")
      : "";
    const geminiBody = {
      system_instruction: systemText ? { parts: [{ text: systemText }] } : undefined,
      contents: [{ role: "user", parts: [{ text: userContent }] }],
      generationConfig: {
        maxOutputTokens: body.max_tokens || 1024,
        temperature: 0.3,
      },
    };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });
    const data = await upstream.json();
    // Traduci risposta Gemini → formato Claude
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return res.status(upstream.status).json({
      content: [{ type: "text", text }],
      id: "gemini-proxy",
      model: "gemini-2.0-flash",
      role: "assistant",
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
