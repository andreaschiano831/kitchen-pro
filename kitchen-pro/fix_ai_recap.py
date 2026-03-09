import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
lines = open(SRC, encoding="utf-8").readlines()

# 1) Aggiungi stato editingOp dopo attachImg state
attach_i = next(i for i,l in enumerate(lines) if "attachImg, setAttachImg" in l and "useState(null)" in l)
lines.insert(attach_i+1, "  const [editingOp, setEditingOp] = useState(null); // {msgIdx, opIdx, fields}\n")
print(f"✓ stato editingOp aggiunto a riga {attach_i+2}")

# 2) Alla riga 7120 (ora +1): dopo setMessages del parser +/- aggiungi ops
# Cerca la riga con setMessages del parser plusMinus
pm_i = next(i for i,l in enumerate(lines) if 'role:"ai",text:reply||"✓ Operazioni eseguite"' in l)
old_pm = lines[pm_i]
# Sostituisci con versione che include ops
lines[pm_i] = (
    "        const ops_pm=[];\n"
    "        ops.forEach(({sign,qty,unit,name,loc})=>{\n"
    "          ops_pm.push({type:sign==='+' ? 'add':'remove',name,qty,unit,loc});\n"
    "        });\n"
    "        setMessages(p=>[...p,{role:\"ai\",text:reply||\"✓ Operazioni eseguite\",ops:ops_pm}]);\n"
)
print(f"✓ ops aggiunti al parser +/- a riga {pm_i+1}")

# 3) Render messaggi: aggiungi mini-card ops dopo il testo
# Cerca il div con messages.map
msg_render_i = next(i for i,l in enumerate(lines) if "messages.map((m,i)=>" in l)
# Trova il div bubble (whiteSpace pre-wrap)
bubble_close_i = next(i for i in range(msg_render_i, msg_render_i+20) if "whiteSpace:\"pre-wrap\"" in lines[i])
# Trova il </div> che chiude il bubble
bubble_div_close = next(i for i in range(bubble_close_i, bubble_close_i+5) if lines[i].strip().startswith("}}>{m.text}</div>"))
old_bubble = lines[bubble_div_close]
lines[bubble_div_close] = (
    "            }}>{m.text}</div>\n"
    "            {m.ops&&m.ops.length>0&&(\n"
    "              <div style={{marginTop:8,display:\"flex\",flexDirection:\"column\",gap:4}}>\n"
    "                {m.ops.map((op,oi)=>(\n"
    "                  editingOp&&editingOp.msgIdx===i&&editingOp.opIdx===oi ? (\n"
    "                    <div key={oi} style={{background:t.bgCard,borderRadius:8,padding:\"8px 10px\",border:`1px solid ${t.gold}`,display:\"flex\",flexDirection:\"column\",gap:6}}>\n"
    "                      <div className=\"mono\" style={{fontSize:8,color:t.gold}}>MODIFICA</div>\n"
    "                      <div style={{display:\"flex\",gap:6,flexWrap:\"wrap\"}}>\n"
    "                        <input value={editingOp.name} onChange={e=>setEditingOp(p=>({...p,name:e.target.value}))} style={{flex:2,minWidth:80,padding:\"4px 6px\",borderRadius:6,border:`1px solid ${t.div}`,background:t.bgAlt,color:t.ink,fontSize:13,fontFamily:\"var(--serif)\",outline:\"none\"}}/>\n"
    "                        <input type=\"number\" value={editingOp.qty} onChange={e=>setEditingOp(p=>({...p,qty:parseFloat(e.target.value)||0}))} style={{width:50,padding:\"4px 6px\",borderRadius:6,border:`1px solid ${t.div}`,background:t.bgAlt,color:t.ink,fontSize:13,fontFamily:\"var(--mono)\",outline:\"none\"}}/>\n"
    "                        <input value={editingOp.unit} onChange={e=>setEditingOp(p=>({...p,unit:e.target.value}))} style={{width:36,padding:\"4px 4px\",borderRadius:6,border:`1px solid ${t.div}`,background:t.bgAlt,color:t.ink,fontSize:12,fontFamily:\"var(--mono)\",outline:\"none\"}}/>\n"
    "                        <select value={editingOp.loc} onChange={e=>setEditingOp(p=>({...p,loc:e.target.value}))} style={{padding:\"4px\",borderRadius:6,border:`1px solid ${t.div}`,background:t.bgAlt,color:t.ink,fontSize:11,fontFamily:\"var(--mono)\",outline:\"none\"}}>\n"
    "                          <option value=\"fridge\">Frigo</option>\n"
    "                          <option value=\"freezer\">Freezer</option>\n"
    "                          <option value=\"dry\">Dispensa</option>\n"
    "                          <option value=\"counter\">Banco</option>\n"
    "                        </select>\n"
    "                      </div>\n"
    "                      <div style={{display:\"flex\",gap:6}}>\n"
    "                        <button onClick={()=>{stockAdd({name:editingOp.name,quantity:editingOp.qty,unit:editingOp.unit,location:editingOp.loc,insertedDate:todayDate()});setEditingOp(null);}} style={{flex:1,padding:\"5px\",borderRadius:7,border:\"none\",cursor:\"pointer\",background:t.gold,color:\"#fff\",fontFamily:\"var(--mono)\",fontSize:9}}>✓ Salva</button>\n"
    "                        <button onClick={()=>setEditingOp(null)} style={{flex:1,padding:\"5px\",borderRadius:7,border:`1px solid ${t.div}`,cursor:\"pointer\",background:\"transparent\",color:t.inkMuted,fontFamily:\"var(--mono)\",fontSize:9}}>Annulla</button>\n"
    "                      </div>\n"
    "                    </div>\n"
    "                  ) : (\n"
    "                    <div key={oi} onClick={()=>setEditingOp({msgIdx:i,opIdx:oi,...op})} style={{display:\"flex\",alignItems:\"center\",gap:6,padding:\"5px 8px\",borderRadius:7,background:t.bgCard,border:`1px solid ${t.div}`,cursor:\"pointer\",transition:\"border-color 0.15s\"}}>\n"
    "                      <span style={{fontSize:11,color:op.type===\"add\"?\"#3D7A4A\":\"#C04A4A\"}}>{op.type===\"add\"?\"✓\":\"✕\"}</span>\n"
    "                      <span style={{fontFamily:\"var(--serif)\",fontStyle:\"italic\",fontSize:12,color:t.ink,flex:1}}>{op.name}</span>\n"
    "                      <span className=\"mono\" style={{fontSize:9,color:t.inkMuted}}>{op.qty} {op.unit}</span>\n"
    "                      <span className=\"mono\" style={{fontSize:8,color:t.inkFaint}}>{op.loc==\"fridge\"?\"❄\":op.loc==\"freezer\"?\"🧊\":op.loc==\"dry\"?\"🏺\":\"🍽\"}</span>\n"
    "                      <span className=\"mono\" style={{fontSize:8,color:t.inkFaint,marginLeft:2}}>✎</span>\n"
    "                    </div>\n"
    "                  )\n"
    "                ))}\n"
    "              </div>\n"
    "            )}\n"
)
print(f"✓ render ops mini-card aggiunto a riga {bubble_div_close+1}")

open(SRC, "w", encoding="utf-8").writelines(lines)
print("DONE")
