import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
BK  = SRC.replace(".tsx","_bk_bredit_"+datetime.datetime.now().strftime("%Y%m%d_%H%M%S")+".tsx")
shutil.copy2(SRC,BK); print("Backup ->",BK)

lines = open(SRC,encoding="utf-8").readlines()

# 1) Aggiungi stati editMode/editText dopo riga con [error, setError] (~1793)
ei = next(i for i,l in enumerate(lines) if "const [error,  setError]" in l and "BriefingPanel" in lines[i-10:i+1] or "const [error,  setError]" in l)
lines.insert(ei+1, "  const [editMode, setEditMode] = React.useState(false);\n")
lines.insert(ei+2, "  const [editText, setEditText] = React.useState(\"\");\n")
print("Stati aggiunti a riga", ei+2)

# Rileggi indici aggiornati
# 2) Trova "result&&(" nel BriefingPanel e sostituisci il blocco result con versione editabile
# Trova riga "{result&&(" 
ri = next(i for i,l in enumerate(lines) if "{result&&(" in l and i > ei)
# Sostituisci solo quella riga aggiungendo il check editMode prima
lines[ri] = (
  "        {result&&(\n"
  "          editMode ? (\n"
  "            <div style={{display:\"flex\",flexDirection:\"column\",gap:10}}>\n"
  "              <div className=\"mono\" style={{fontSize:8,color:t.inkFaint,marginBottom:4}}>MODIFICA TESTO LIBERO</div>\n"
  "              <textarea value={editText} onChange={e=>setEditText(e.target.value)}\n"
  "                style={{width:\"100%\",minHeight:320,padding:\"12px\",borderRadius:10,border:`1px solid ${t.div}`,\n"
  "                  background:t.bgAlt,color:t.ink,fontFamily:\"var(--serif)\",fontSize:13,lineHeight:1.7,resize:\"vertical\",outline:\"none\"}}/>\n"
  "              <button onClick={()=>setEditMode(false)} style={{padding:\"8px\",borderRadius:8,border:\"none\",cursor:\"pointer\",background:t.gold,color:\"#fff\",fontFamily:\"var(--mono)\",fontSize:10}}>✓ Chiudi modifica</button>\n"
  "            </div>\n"
  "          ) : (\n"
)
print("Blocco editMode inserito a riga", ri+1)

# 3) Trova la chiusura del blocco result: ultima riga prima dei bottoni share = "</div>" che chiude il result
# Trova riga con "↺ Rigenera" nel BriefingPanel (seconda occorrenza)
reg_lines = [i for i,l in enumerate(lines) if "Rigenera" in l]
regen_i = reg_lines[1] if len(reg_lines)>1 else reg_lines[0]

# Inserisci bottone ✏ Modifica e chiudi il ternario editMode prima dei bottoni
lines[regen_i] = (
  "            <div style={{display:\"flex\",gap:8,flexWrap:\"wrap\"}}>\n"
  "              <button onClick={generate} style={{flex:1,padding:\"10px\",borderRadius:10,border:`1px solid ${t.div}`,cursor:\"pointer\",background:\"transparent\",color:t.inkMuted,fontFamily:\"var(--mono)\",fontSize:10}}>↺ Rigenera</button>\n"
  "              <button onClick={()=>{function bt(r){const rows=[r.intestazione,\"\",\"PRIORITA:\",...(r.priorita_giornaliere||[]).map((p,i)=>(i+1)+\". \"+p)];if(r.mep_urgente?.length){rows.push(\"\",\"MEP URGENTE:\");r.mep_urgente.forEach(m=>rows.push(\"- \"+m.nome+(m.da_fare_entro?\" -> \"+m.da_fare_entro:\"\")));}if(r.allerte_haccp?.length){rows.push(\"\",\"HACCP:\");r.allerte_haccp.forEach(a=>rows.push(\"- \"+a));}if(r.nota_chef){rows.push(\"\",\"NOTA CHEF:\",r.nota_chef);}return rows.join(\"\\n\");}setEditText(editMode?editText:bt(result));setEditMode(e=>!e);}} style={{padding:\"10px 14px\",borderRadius:10,border:`1px solid ${t.div}`,cursor:\"pointer\",background:editMode?t.gold+\"20\":\"transparent\",color:editMode?t.gold:t.inkMuted,fontFamily:\"var(--mono)\",fontSize:10}}>{editMode?\"× Chiudi\":\"✏ Modifica\"}</button>\n"
)
print("Bottone modifica aggiunto a riga", regen_i+1)

# 4) Trova la riga dei bottoni Copia/WhatsApp/Stampa e chiudi il ternario dopo
wa_i = next(i for i,l in enumerate(lines) if "WhatsApp" in l and i > regen_i)
# Trova la chiusura </div> dopo WhatsApp
close_i = next(i for i,l in enumerate(lines) if l.strip()=="</div>" and i > wa_i)
lines.insert(close_i+1, "          )\n")
lines.insert(close_i+2, "        )}\n")
# Rimuovi il vecchio )} che chiudeva result&&(
old_close = next(i for i,l in enumerate(lines) if l.strip()===")}" and i > close_i+2 and i < close_i+6)
del lines[old_close]
print("Chiusura ternario aggiunta")

open(SRC,"w",encoding="utf-8").writelines(lines)
print("OK")
