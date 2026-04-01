const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`);
  const data = await r.json();
  const names = (data.models||[]).map(m=>m.name);
  return res.status(200).json({models: names});
}
