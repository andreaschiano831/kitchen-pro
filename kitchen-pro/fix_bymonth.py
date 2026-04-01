SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
lines = open(SRC, encoding="utf-8").readlines()

# Trova byMonth in ArchivioFatture e sostituisci con versione da byFattura
start = next(i for i,l in enumerate(lines) if '// Raggruppa per mese' in l and 'byMonth' in lines[i+1])
end = next(i for i in range(start, start+10) if lines[i].strip().startswith('});') and 'storico' in ''.join(lines[start:i]))
print(f"sostituisco righe {start+1}-{end+1}")

new_block = [
'  // Raggruppa fatture per mese da byFattura\n',
'  const byMonth:{[k:string]:string[]}={};\n',
'  Object.keys(byFattura).forEach(fid=>{\n',
'    const first=byFattura[fid][0];\n',
'    const m=(first?.dataFattura||"").slice(0,7)||"senza-data";\n',
'    if(!byMonth[m]) byMonth[m]=[];\n',
'    byMonth[m].push(fid);\n',
'  });\n',
]
lines[start:end+1] = new_block
open(SRC, "w", encoding="utf-8").writelines(lines)
print("DONE")
