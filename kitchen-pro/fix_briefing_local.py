import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
BK  = SRC.replace(".tsx","_bk_bl4_"+datetime.datetime.now().strftime("%Y%m%d_%H%M%S")+".tsx")
shutil.copy2(SRC,BK); print("Backup ->",BK)

lines = open(SRC,encoding="utf-8").readlines()

# righe 1795-1815 (0-indexed: 1794-1814) = async generate fino a prima di useEffect
start = 1794  # riga 1795
end   = 1815  # riga 1816 (useEffect) esclusa

print("Sostituisco righe",start+1,"->",end)
print("Prima:", lines[start][:60])
print("Ultima da sostituire:", lines[end-1][:60])

new_lines = [
  "  function generate() {\n",
  "    setLoading(true); setResult(null); setError(null);\n",
  "    try {\n",
  "      const now = Date.now();\n",
  "      const allItems = [...(kitchen?.freezer||[]),...(kitchen?.fridge||[]),...(kitchen?.dry||[]),...(kitchen?.counter||[])];\n",
  "      const scaduti = allItems.filter(x=>x.expiresAt&&new Date(x.expiresAt)<new Date());\n",
  "      const in72h = allItems.filter(x=>x.expiresAt&&new Date(x.expiresAt)>new Date()&&(new Date(x.expiresAt)-now)<72*3600000).sort((a,b)=>new Date(a.expiresAt).getTime()-new Date(b.expiresAt).getTime());\n",
  "      const sottoPar = allItems.filter(x=>x.parLevel>0&&x.quantity<x.parLevel);\n",
  "      const preps = (kitchen?.preparazioni||[]).filter(p=>p.status!==\"smistata\"&&p.status!==\"svolta\");\n",
  "      const data = new Date().toLocaleDateString(\"it-IT\",{weekday:\"long\",day:\"2-digit\",month:\"long\"});\n",
  "      const priorita = [];\n",
  "      if(scaduti.length>0) priorita.push(scaduti.length+\" prodotti scaduti da rimuovere: \"+scaduti.slice(0,3).map(x=>x.name).join(\", \")+(scaduti.length>3?\" e altri\":\"\"));\n",
  "      if(in72h.length>0) priorita.push(in72h.length+\" articoli in scadenza entro 72h: \"+in72h.slice(0,3).map(x=>x.name).join(\", \"));\n",
  "      if(sottoPar.length>0) priorita.push(\"Scorte basse: \"+sottoPar.slice(0,4).map(x=>x.name+\" (\"+x.quantity+\"/\"+x.parLevel+\" \"+x.unit+\")\").join(\", \"));\n",
  "      if(preps.filter(p=>p.status===\"da_fare\").length>0) priorita.push(preps.filter(p=>p.status===\"da_fare\").length+\" preparazioni da avviare\");\n",
  "      if(priorita.length===0) priorita.push(\"Cucina in ordine — nessuna criticita urgente\");\n",
  "      const mep_urgente = preps.slice(0,8).map(p=>({nome:p.nome+(p.quantita?\" x\"+p.quantita+(p.unitaMisura?\" \"+p.unitaMisura:\"\"):\"\"),da_fare_entro:p.scadeIl?new Date(p.scadeIl).toLocaleDateString(\"it-IT\",{day:\"2-digit\",month:\"2-digit\"}):'oggi'}));\n",
  "      const allerte_haccp = [];\n",
  "      if(scaduti.length>0) allerte_haccp.push(\"Rimuovere prodotti scaduti: \"+scaduti.map(x=>x.name).join(\", \"));\n",
  "      if(in72h.length>0) allerte_haccp.push(\"Verificare rotazione FIFO: \"+in72h.slice(0,3).map(x=>x.name).join(\", \"));\n",
  "      const nota_chef = preps.length===0 ? \"Tutte le preparazioni completate. Ottimo lavoro.\" : \"Priorita: \"+preps.slice(0,2).map(p=>p.nome).join(\" e \")+(preps.length>2?\" e altre \"+(preps.length-2)+\" prep\":\"\");\n",
  "      setResult({intestazione:\"Briefing \"+kitchen?.name+\" \"+data+\" - \"+(kitchen?.members?.length||1)+\" in brigata\",priorita_giornaliere:priorita,mep_urgente,allerte_haccp,nota_chef});\n",
  "    } catch(e){setError(\"Errore: \"+e.message);}\n",
  "    setLoading(false);\n",
  "  }\n",
]

lines[start:end] = new_lines
open(SRC,"w",encoding="utf-8").writelines(lines)
print("OK")
