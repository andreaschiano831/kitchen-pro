import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
BK  = SRC.replace(".tsx","_bk_bredit4_"+datetime.datetime.now().strftime("%Y%m%d_%H%M%S")+".tsx")
shutil.copy2(SRC,BK); print("Backup ->",BK)

lines = open(SRC,encoding="utf-8").readlines()

# Verifica righe chiave
print("1794:", lines[1793].strip())  # deve essere error,setError
print("1869:", lines[1868].strip())  # deve essere <div flex gap:8
print("1892:", lines[1891].strip())  # deve essere </div> chiude bottoni

# 1) Stato editMode dopo riga 1794 (idx 1793)
lines.insert(1794, '  const [editMode, setEditMode] = React.useState(false);\n')
lines.insert(1795, '  const [editText, setEditText] = React.useState("");\n')

# 2) Bottone Modifica prima di Stampa - Stampa ora a idx 1893 (1891+2)
stampa_idx = next(i for i,l in enumerate(lines) if 'window.print()' in l and i > 1860)
print("Stampa idx:", stampa_idx+1)
lines.insert(stampa_idx, '              <button onClick={()=>{const r=result;const rows=[r.intestazione,"","PRIORITA:",...(r.priorita_giornaliere||[]).map((p,i)=>(i+1)+". "+p)];if(r.mep_urgente&&r.mep_urgente.length){rows.push("","MEP URGENTE:");r.mep_urgente.forEach(m=>rows.push("- "+m.nome+(m.da_fare_entro?" -> "+m.da_fare_entro:"")));}if(r.allerte_haccp&&r.allerte_haccp.length){rows.push("","HACCP:");r.allerte_haccp.forEach(a=>rows.push("- "+a));}if(r.nota_chef){rows.push("","NOTA CHEF:",r.nota_chef);}setEditText(rows.join("\\n"));setEditMode(e=>!e);}} style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${t.div}`,cursor:"pointer",background:editMode?t.gold+"20":"transparent",color:editMode?t.gold:t.inkMuted,fontFamily:"var(--mono)",fontSize:10}}>{editMode?"x Vista":"Edit"}</button>\n')

# 3) Textarea dopo </div> che chiude i bottoni
close_div_idx = next(i for i,l in enumerate(lines) if l.strip()=="</div>" and i > stampa_idx)
print("Close div idx:", close_div_idx+1)
lines.insert(close_div_idx+1, '            {editMode&&<textarea value={editText} onChange={e=>setEditText(e.target.value)} style={{width:"100%",minHeight:280,padding:"12px",borderRadius:10,border:`1px solid ${t.div}`,background:t.bgAlt,color:t.ink,fontFamily:"var(--serif)",fontSize:13,lineHeight:1.7,resize:"vertical",outline:"none",marginTop:8}}/>\n')

open(SRC,"w",encoding="utf-8").writelines(lines)
print("OK")
