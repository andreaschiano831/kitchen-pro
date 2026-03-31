SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
txt = open(SRC, encoding="utf-8").read()

# Trova la funzione testKey per indice
start = txt.index("  async function testKey() {")
end = txt.index("  }", start) + 3
old = txt[start:end]
print("trovato:", old[:60])

new = '''  async function testKey() {
    const k = key.trim();
    if(!k){ setTestStatus("fail"); setTestMsg("Inserisci prima una chiave."); return; }
    localStorage.setItem("kp-api-key", k);
    setTestStatus("testing"); setTestMsg("Test in corso\u2026");
    try {
      const res = await fetch("/api/ai", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          system:"Rispondi solo con: ok",
          messages:[{role:"user",content:"ping"}],
          max_tokens:10,
        })
      });
      const data = await res.json();
      if(res.ok && data?.content?.[0]?.text){ setTestStatus("ok"); setTestMsg("\u2713 AI funzionante! Gemini risponde."); }
      else if(data?.error?.includes("API_KEY")){ setTestStatus("fail"); setTestMsg("\u2717 GEMINI_API_KEY non configurata su Vercel."); }
      else { setTestStatus("fail"); setTestMsg("\u2717 Errore: "+(data?.error||res.status)); }
    } catch(e:any){
      setTestStatus("fail"); setTestMsg("\u2717 Errore rete: "+e.message);
    }
  }'''

txt = txt.replace(old, new)
open(SRC, "w", encoding="utf-8").write(txt)
print("OK")
