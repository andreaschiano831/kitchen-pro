SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
lines = open(SRC, encoding="utf-8").readlines()

# Sostituisci tutto il return di ArchivioFatture (righe 4142-4325, idx 4141-4324)
ret_i = 4141
end_i = 4324

new_return = [
'  return (\n',
'    <div style={{background:t.bgAlt,borderRadius:14,border:"1px solid "+t.div,overflow:"hidden"}}>\n',
'      <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:ingredienti.length?"1px solid "+t.div:"none"}}>\n',
'        <div className="mono" style={{fontSize:9,color:t.gold,letterSpacing:"0.1em"}}>ARCHIVIO INGREDIENTI ({ingredienti.length})</div>\n',
'      </div>\n',
'      {ingredienti.length===0&&<div style={{padding:"20px",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",textAlign:"center",fontSize:12}}>Nessun ingrediente — carica una fattura</div>}\n',
'      {months.map((m:string)=>(\n',
'        <div key={m} style={{borderBottom:"1px solid "+t.div}}>\n',
'          <div style={{padding:"8px 16px",background:t.bgCard,display:"flex",justifyContent:"space-between",alignItems:"center"}}>\n',
'            <span className="mono" style={{fontSize:10,color:t.secondary,fontWeight:600}}>{fmtMonth(m)}</span>\n',
'            <span className="mono" style={{fontSize:9,color:t.inkFaint}}>{byMonth[m].length} fatture</span>\n',
'          </div>\n',
'          {(byMonth[m] as string[]).map((fid:string)=>{\n',
'            const ings=byFattura[fid]||[];\n',
'            const first=ings[0];\n',
'            const isOpen=expanded===fid;\n',
'            const tot=ings.reduce((s:number,ing:any)=>s+(ing.prezzoTotale||0),0);\n',
'            return (\n',
'              <div key={fid}>\n',
'                <div onClick={()=>setExpanded(isOpen?null:fid)} style={{padding:"10px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",background:isOpen?t.bgAlt:"transparent",borderTop:"1px solid "+t.div+"44"}}>\n',
'                  <span style={{fontSize:14}}>📄</span>\n',
'                  <div style={{flex:1,minWidth:0}}>\n',
'                    <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,color:t.ink}}>{first?.fornitore||"Fattura"}{first?.numeroFattura?" #"+first.numeroFattura:""}</div>\n',
'                    <div className="mono" style={{fontSize:9,color:t.inkFaint,marginTop:2}}>{first?.dataFattura} · {ings.length} ingredienti{tot>0?" · €"+tot.toFixed(2):""}</div>\n',
'                  </div>\n',
'                  <span style={{fontSize:11,color:t.inkFaint}}>{isOpen?"▲":"▼"}</span>\n',
'                </div>\n',
'                {isOpen&&(\n',
'                  <div style={{padding:"8px 16px 12px",display:"flex",flexDirection:"column",gap:6}}>\n',
'                    {ings.map((ing:any)=>(\n',
'                      <div key={ing.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:9,background:t.bgCard,border:"1px solid "+t.div}}>\n',
'                        <div style={{flex:1,minWidth:0}}>\n',
'                          <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink}}>{ing.nome}</div>\n',
'                          <div className="mono" style={{fontSize:9,color:t.inkFaint,marginTop:2,display:"flex",flexWrap:"wrap",gap:6}}>\n',
'                            <span>{ing.qty} {ing.unit}</span>\n',
'                            {ing.lotto&&<span style={{color:t.gold}}>#{ing.lotto}</span>}\n',
'                            {ing.scadenza&&<span>scad:{ing.scadenza}</span>}\n',
'                            {ing.prezzoUnitario&&<span style={{color:t.success}}>€{ing.prezzoUnitario}/{ing.unit}</span>}\n',
'                            {ing.prezzoTotale&&<span style={{color:t.success,fontWeight:600}}>€{ing.prezzoTotale}</span>}\n',
'                          </div>\n',
'                        </div>\n',
'                        <button onClick={()=>ingredienteRemove(ing.id)} style={{padding:"4px 6px",borderRadius:6,border:"none",cursor:"pointer",background:t.accentGlow,color:t.danger,fontFamily:"var(--mono)",fontSize:8}}>✕</button>\n',
'                      </div>\n',
'                    ))}\n',
'                  </div>\n',
'                )}\n',
'              </div>\n',
'            );\n',
'          })}\n',
'        </div>\n',
'      ))}\n',
'    </div>\n',
'  );\n',
'}\n',
]

lines[ret_i:end_i+1] = new_return
print(f"✓ return ArchivioFatture sostituito ({end_i-ret_i+1} righe → {len(new_return)})")

# Fix SemilavView - usa kitchen.ingredienti
txt = "".join(lines)

old3 = 'const fattureStorico:any[]=(() => {try{return JSON.parse(localStorage.getItem("fatture-storico")||"[]");}catch{return[];}})();\n  const tre=Date.now()-3*86400000;\n  const lottiFatture=fattureStorico.filter((f:any)=>new Date(f.at).getTime()>tre).flatMap((f:any)=>f.prodotti.filter((p:any)=>p.lotto).map((p:any)=>({nome:p.nome,lotto:p.lotto,data:f.data,src:"fattura"})));'
new3 = 'const ingredientiArch=(kitchen?.ingredienti||[]).filter((x:any)=>x.lotto);'
if txt.count(old3)==1:
    txt = txt.replace(old3, new3)
    print("✓ SemilavView usa kitchen.ingredienti")

old4 = '{lottiFatture.length>0&&<optgroup label="📄 Fatture (72h)">{lottiFatture.map((l:any,li:number)=><option key={li} value={l.lotto}>{l.nome} #{l.lotto} ({l.data})</option>)}</optgroup>}'
new4 = '{ingredientiArch.length>0&&<optgroup label="📄 Archivio Ingredienti">{ingredientiArch.map((i:any)=><option key={i.id} value={i.lotto}>{i.nome} #{i.lotto} ({i.dataFattura})</option>)}</optgroup>}'
if txt.count(old4)==1:
    txt = txt.replace(old4, new4)
    print("✓ optgroup ingredienti aggiornato")

open(SRC, "w", encoding="utf-8").write(txt)
print("DONE")
