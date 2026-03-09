import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
lines = open(SRC, encoding="utf-8").readlines()

# Verifica stato già aggiunto
already = any("editingOp, setEditingOp" in l for l in lines)
print("editingOp già presente:", already)

# Riga 7349 (idx 7348) = }}>{m.text}</div>
bubble_i = 7348
print("Riga bubble:", lines[bubble_i].strip()[:60])

lines[bubble_i] = (
    "            }}>{m.text}</div>\n"
    "            {m.ops&&m.ops.length>0&&(\n"
    "              <div style={{marginTop:8,display:\"flex\",flexDirection:\"column\",gap:4}}>\n"
    "                {m.ops.map((op,oi)=>(\n"
    "                  editingOp&&editingOp.msgIdx===i&&editingOp.opIdx===oi ? (\n"
    "                    <div key={oi} style={{background:t.bgCard,borderRadius:8,padding:\"8px 10px\",border:\"1px solid \"+t.gold,display:\"flex\",flexDirection:\"column\",gap:6}}>\n"
    "                      <div className=\"mono\" style={{fontSize:8,color:t.gold}}>MODIFICA</div>\n"
    "                      <div style={{display:\"flex\",gap:6,flexWrap:\"wrap\"}}>\n"
    "                        <input value={editingOp.name} onChange={e=>setEditingOp(p=>({...p,name:e.target.value}))} style={{flex:2,minWidth:80,padding:\"4px 6px\",borderRadius:6,border:\"1px solid \"+t.div,background:t.bgAlt,color:t.ink,fontSize:13,fontFamily:\"var(--serif)\",outline:\"none\"}}/>\n"
    "                        <input type=\"number\" value={editingOp.qty} onChange={e=>setEditingOp(p=>({...p,qty:parseFloat(e.target.value)||0}))} style={{width:50,padding:\"4px 6px\",borderRadius:6,border:\"1px solid \"+t.div,background:t.bgAlt,color:t.ink,fontSize:13,outline:\"none\"}}/>\n"
    "                        <input value={editingOp.unit} onChange={e=>setEditingOp(p=>({...p,unit:e.target.value}))} style={{width:36,padding:\"4px\",borderRadius:6,border:\"1px solid \"+t.div,background:t.bgAlt,color:t.ink,fontSize:12,outline:\"none\"}}/>\n"
    "                        <select value={editingOp.loc} onChange={e=>setEditingOp(p=>({...p,loc:e.target.value}))} style={{padding:\"4px\",borderRadius:6,border:\"1px solid \"+t.div,background:t.bgAlt,color:t.ink,fontSize:11,outline:\"none\"}}>\n"
    "                          <option value=\"fridge\">Frigo</option>\n"
    "                          <option value=\"freezer\">Freezer</option>\n"
    "                          <option value=\"dry\">Dispensa</option>\n"
    "                          <option value=\"counter\">Banco</option>\n"
    "                        </select>\n"
    "                      </div>\n"
    "                      <div style={{display:\"flex\",gap:6}}>\n"
    "                        <button onClick={()=>{stockAdd({name:editingOp.name,quantity:editingOp.qty,unit:editingOp.unit,location:editingOp.loc,insertedDate:todayDate()});setEditingOp(null);}} style={{flex:1,padding:\"5px\",borderRadius:7,border:\"none\",cursor:\"pointer\",background:t.gold,color:\"#fff\",fontFamily:\"var(--mono)\",fontSize:9}}>Salva</button>\n"
    "                        <button onClick={()=>setEditingOp(null)} style={{flex:1,padding:\"5px\",borderRadius:7,border:\"1px solid \"+t.div,cursor:\"pointer\",background:\"transparent\",color:t.inkMuted,fontFamily:\"var(--mono)\",fontSize:9}}>Annulla</button>\n"
    "                      </div>\n"
    "                    </div>\n"
    "                  ) : (\n"
    "                    <div key={oi} onClick={()=>setEditingOp({msgIdx:i,opIdx:oi,...op})} style={{display:\"flex\",alignItems:\"center\",gap:6,padding:\"5px 8px\",borderRadius:7,background:t.bgCard,border:\"1px solid \"+t.div,cursor:\"pointer\"}}>\n"
    "                      <span style={{fontSize:11,color:op.type===\"add\"?\"#3D7A4A\":\"#C04A4A\"}}>{op.type===\"add\"?\"✓\":\"✕\"}</span>\n"
    "                      <span style={{fontFamily:\"var(--serif)\",fontStyle:\"italic\",fontSize:12,color:t.ink,flex:1}}>{op.name}</span>\n"
    "                      <span style={{fontFamily:\"var(--mono)\",fontSize:9,color:t.inkMuted}}>{op.qty} {op.unit}</span>\n"
    "                      <span style={{fontFamily:\"var(--mono)\",fontSize:8,color:t.inkFaint}}>{op.loc===\"fridge\"?\"Frigo\":op.loc===\"freezer\"?\"Freezer\":op.loc===\"dry\"?\"Dispensa\":\"Banco\"}</span>\n"
    "                      <span style={{fontFamily:\"var(--mono)\",fontSize:8,color:t.inkFaint}}>✎</span>\n"
    "                    </div>\n"
    "                  )\n"
    "                ))}\n"
    "              </div>\n"
    "            )}\n"
)
print("✓ mini-card render inserito")

open(SRC, "w", encoding="utf-8").writelines(lines)
print("DONE")
