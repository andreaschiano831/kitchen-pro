SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
txt = open(SRC, encoding="utf-8").read()

old = "  const ingredientiArch=(kitchen?.ingredienti||[]).filter((x:any)=>x.lotto);"
new = (
    "  // Ingredienti ultima settimana con lotto, divisi per fornitore\n"
    "  const settimana = Date.now() - 7*86400000;\n"
    "  const ingredientiArch=(kitchen?.ingredienti||[])\n"
    "    .filter((x:any)=>x.lotto && new Date(x.createdAt||0).getTime()>settimana)\n"
    "    .sort((a:any,b:any)=>new Date(b.createdAt||0).getTime()-new Date(a.createdAt||0).getTime());\n"
    "  const fornArchivio:{[k:string]:any[]}={};\n"
    "  ingredientiArch.forEach((i:any)=>{ const k=i.fornitore||\"-\"; if(!fornArchivio[k]) fornArchivio[k]=[]; fornArchivio[k].push(i); });"
)
assert txt.count(old)==1
txt = txt.replace(old, new)
print("OK ingredientiArch")

old2 = '                  {ingredientiArch.length>0&&<optgroup label="📄 Archivio Ingredienti">{ingredientiArch.map((i:any)=><option key={i.id} value={i.lotto}>{i.nome} #{i.lotto} ({i.dataFattura})</option>)}</optgroup>}'
new2 = '                  {Object.keys(fornArchivio).map((forn:string)=><optgroup key={forn} label={"📄 "+forn}>{fornArchivio[forn].map((i:any)=><option key={i.id} value={i.lotto}>{i.nome} #{i.lotto} ({i.dataFattura})</option>)}</optgroup>)}'
assert txt.count(old2)==1
txt = txt.replace(old2, new2)
print("OK optgroup per fornitore")

open(SRC, "w", encoding="utf-8").write(txt)
print("DONE")
