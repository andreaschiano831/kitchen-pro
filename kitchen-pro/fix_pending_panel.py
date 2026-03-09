SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
lines = open(SRC, encoding="utf-8").readlines()

msg_i = next(i for i,l in enumerate(lines) if '{/* Messages */}' in l)
print('Inserisco prima di riga', msg_i+1)

panel = (
'      {/* Pending ops */}\n'
'      {pendingOps&&(\n'
'        <div style={{padding:"12px 14px",borderBottom:"1px solid "+t.div,background:t.bgAlt,display:"flex",flexDirection:"column",gap:8}}>\n'
'          <div className="mono" style={{fontSize:9,color:t.gold,letterSpacing:"0.1em"}}>CONFERMA OPERAZIONI</div>\n'
'          <div style={{display:"flex",flexDirection:"column",gap:5}}>\n'
'            {pendingOps.map((op,oi)=>(\n'
'              <div key={oi} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:7,background:t.bgCard,border:"1px solid "+t.div}}>\n'
'                <span style={{fontSize:11,color:op.type==="add"?"#3D7A4A":"#C04A4A"}}>{op.type==="add"?"+ ":"- "}</span>\n'
'                <input value={op.name} onChange={e=>{const n=[...pendingOps];n[oi]={...n[oi],name:e.target.value};setPendingOps(n);}} style={{flex:2,minWidth:60,padding:"3px 5px",borderRadius:5,border:"1px solid "+t.div,background:t.bgAlt,color:t.ink,fontSize:12,fontFamily:"var(--serif)",outline:"none"}}/>\n'
'                <input type="number" value={op.qty} onChange={e=>{const n=[...pendingOps];n[oi]={...n[oi],qty:parseFloat(e.target.value)||0};setPendingOps(n);}} style={{width:44,padding:"3px 4px",borderRadius:5,border:"1px solid "+t.div,background:t.bgAlt,color:t.ink,fontSize:12,outline:"none"}}/>\n'
'                <input value={op.unit} onChange={e=>{const n=[...pendingOps];n[oi]={...n[oi],unit:e.target.value};setPendingOps(n);}} style={{width:32,padding:"3px",borderRadius:5,border:"1px solid "+t.div,background:t.bgAlt,color:t.ink,fontSize:11,outline:"none"}}/>\n'
'                <select value={op.loc} onChange={e=>{const n=[...pendingOps];n[oi]={...n[oi],loc:e.target.value};setPendingOps(n);}} style={{padding:"3px",borderRadius:5,border:"1px solid "+t.div,background:t.bgAlt,color:t.ink,fontSize:10,outline:"none"}}>\n'
'                  <option value="fridge">Frigo</option><option value="freezer">Freezer</option><option value="dry">Dispensa</option><option value="counter">Banco</option>\n'
'                </select>\n'
'                <button onClick={()=>setPendingOps(prev=>(prev||[]).filter((_,j)=>j!==oi))} style={{background:"none",border:"none",color:t.danger,cursor:"pointer",fontSize:14}}>x</button>\n'
'              </div>\n'
'            ))}\n'
'          </div>\n'
'          <div style={{display:"flex",gap:8}}>\n'
'            <button onClick={()=>{\n'
'              const ops=pendingOps||[];\n'
'              ops.forEach((op:any)=>{\n'
'                if(op.type==="add") stockAdd({name:op.name,quantity:op.qty,unit:op.unit,location:op.loc,insertedDate:todayDate()});\n'
'                else { const f=allItems().find((x:any)=>x.name.toLowerCase().includes(op.name.toLowerCase())); if(f) adjustItem(f.id,-op.qty); }\n'
'              });\n'
'              const recap=ops.map((op:any)=>op.type==="add"?"+ "+op.name+" ("+op.qty+" "+op.unit+") "+op.loc:"- scalato "+op.name).join("\\n");\n'
'              setMessages(p=>[...p,{role:"ai",text:recap}]);\n'
'              setPendingOps(null);\n'
'            }} style={{flex:1,padding:"7px",borderRadius:8,border:"none",cursor:"pointer",background:t.gold,color:"#fff",fontFamily:"var(--mono)",fontSize:10,fontWeight:600}}>Conferma</button>\n'
'            <button onClick={()=>setPendingOps(null)} style={{flex:1,padding:"7px",borderRadius:8,border:"1px solid "+t.div,cursor:"pointer",background:"transparent",color:t.inkMuted,fontFamily:"var(--mono)",fontSize:10}}>Annulla</button>\n'
'          </div>\n'
'        </div>\n'
'      )}\n'
)

lines.insert(msg_i, panel)
open(SRC, "w", encoding="utf-8").writelines(lines)
print("DONE")
