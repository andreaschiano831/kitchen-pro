SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
lines = open(SRC, encoding="utf-8").readlines()

# 1) Aggiungi tab "semilavorati" nella lista tab HACCP
tab_i = next(i for i,l in enumerate(lines) if '{k:"ia",l:"🛡 IA Compliance"}' in l)
old = lines[tab_i]
lines[tab_i] = old.replace(
    '{k:"ia",l:"🛡 IA Compliance"}',
    '{k:"semilavorati",l:"🏷 Semilavorati"},{k:"ia",l:"🛡 IA Compliance"}'
)
print(f"✓ tab semilavorati aggiunto a riga {tab_i+1}")

# 2) Trova {tab==="ia"&&( e inserisci blocco semilavorati prima
ia_tab_i = next(i for i,l in enumerate(lines) if 'tab==="ia"&&(' in l)

semilav_block = r"""      {tab==="semilavorati"&&(()=>{
        const SLKEY=`semilav-${kitchen?.id}`;
        const [slList,setSlList]=window["React"].useState(()=>{try{return JSON.parse(localStorage.getItem(SLKEY)||"[]");}catch{return[];}});
        const [slForm,setSlForm]=window["React"].useState({nome:"",dataProd:todayDate(),scadGiorni:"3",nota:"",ingredienti:[{nome:"",lotto:"",qty:"",unit:"kg"}]});
        const [showForm,setShowForm]=window["React"].useState(false);
        const [printItem,setPrintItem]=window["React"].useState(null);
        const saveList=(l)=>{setSlList(l);localStorage.setItem(SLKEY,JSON.stringify(l));};
        const preps=kitchen?.preps||[];
        const lots=allItems().filter(x=>x.lot);
        return (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:15,color:t.ink}}>Semilavorati registrati</span>
              <button onClick={()=>setShowForm(p=>!p)} style={{padding:"7px 16px",borderRadius:9,border:"none",cursor:"pointer",background:t.gold,color:"#fff",fontFamily:"var(--mono)",fontSize:10}}>+ Nuovo</button>
            </div>
            {showForm&&(
              <div style={{background:t.bgAlt,borderRadius:14,padding:"16px",border:"1px solid "+t.div,display:"flex",flexDirection:"column",gap:10}}>
                <div className="mono" style={{fontSize:9,color:t.gold,letterSpacing:"0.1em"}}>NUOVO SEMILAVORATO</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <input placeholder="Nome semilavorato" value={slForm.nome} onChange={e=>setSlForm(p=>({...p,nome:e.target.value}))} style={{flex:2,minWidth:140,padding:"7px 10px",borderRadius:8,border:"1px solid "+t.div,background:t.bgCard,color:t.ink,fontFamily:"var(--serif)",fontSize:13,outline:"none"}}/>
                  <input type="date" value={slForm.dataProd} onChange={e=>setSlForm(p=>({...p,dataProd:e.target.value}))} style={{padding:"7px 10px",borderRadius:8,border:"1px solid "+t.div,background:t.bgCard,color:t.ink,fontFamily:"var(--mono)",fontSize:12,outline:"none"}}/>
                  <input placeholder="Scad (giorni)" type="number" value={slForm.scadGiorni} onChange={e=>setSlForm(p=>({...p,scadGiorni:e.target.value}))} style={{width:100,padding:"7px 8px",borderRadius:8,border:"1px solid "+t.div,background:t.bgCard,color:t.ink,fontFamily:"var(--mono)",fontSize:12,outline:"none"}}/>
                </div>
                <div className="mono" style={{fontSize:9,color:t.inkMuted,marginTop:4}}>INGREDIENTI / LOTTI</div>
                {slForm.ingredienti.map((ing,ii)=>(
                  <div key={ii} style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                    <input placeholder="Ingrediente" value={ing.nome} onChange={e=>{const a=[...slForm.ingredienti];a[ii]={...a[ii],nome:e.target.value};setSlForm(p=>({...p,ingredienti:a}));}} style={{flex:2,minWidth:100,padding:"5px 8px",borderRadius:7,border:"1px solid "+t.div,background:t.bgCard,color:t.ink,fontSize:12,fontFamily:"var(--serif)",outline:"none"}}/>
                    <select value={ing.lotto} onChange={e=>{const a=[...slForm.ingredienti];a[ii]={...a[ii],lotto:e.target.value};setSlForm(p=>({...p,ingredienti:a}));}} style={{flex:1,minWidth:80,padding:"5px",borderRadius:7,border:"1px solid "+t.div,background:t.bgCard,color:t.ink,fontSize:11,outline:"none"}}>
                      <option value="">Lotto (opz.)</option>
                      {lots.map(x=><option key={x.id} value={x.lot}>{x.name} — {x.lot}</option>)}
                    </select>
                    <input placeholder="Qty" value={ing.qty} onChange={e=>{const a=[...slForm.ingredienti];a[ii]={...a[ii],qty:e.target.value};setSlForm(p=>({...p,ingredienti:a}));}} style={{width:50,padding:"5px",borderRadius:7,border:"1px solid "+t.div,background:t.bgCard,color:t.ink,fontSize:12,outline:"none"}}/>
                    <select value={ing.unit} onChange={e=>{const a=[...slForm.ingredienti];a[ii]={...a[ii],unit:e.target.value};setSlForm(p=>({...p,ingredienti:a}));}} style={{width:50,padding:"5px",borderRadius:7,border:"1px solid "+t.div,background:t.bgCard,color:t.ink,fontSize:11,outline:"none"}}>
                      <option>kg</option><option>g</option><option>l</option><option>ml</option><option>pz</option>
                    </select>
                    <button onClick={()=>{const a=slForm.ingredienti.filter((_,j)=>j!==ii);setSlForm(p=>({...p,ingredienti:a.length?a:[{nome:"",lotto:"",qty:"",unit:"kg"}]}));}} style={{background:"none",border:"none",color:t.danger,cursor:"pointer",fontSize:16}}>✕</button>
                  </div>
                ))}
                <button onClick={()=>setSlForm(p=>({...p,ingredienti:[...p.ingredienti,{nome:"",lotto:"",qty:"",unit:"kg"}]}))} style={{alignSelf:"flex-start",padding:"5px 12px",borderRadius:7,border:"1px solid "+t.div,cursor:"pointer",background:"transparent",color:t.inkMuted,fontFamily:"var(--mono)",fontSize:9}}>+ Ingrediente</button>
                <textarea placeholder="Note (allergeni, conservazione...)" value={slForm.nota} onChange={e=>setSlForm(p=>({...p,nota:e.target.value}))} rows={2} style={{padding:"7px 10px",borderRadius:8,border:"1px solid "+t.div,background:t.bgCard,color:t.ink,fontFamily:"var(--serif)",fontSize:12,resize:"vertical",outline:"none"}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{
                    if(!slForm.nome.trim()){toast("Nome obbligatorio","error");return;}
                    const scad=new Date(slForm.dataProd);scad.setDate(scad.getDate()+parseInt(slForm.scadGiorni||"3"));
                    const item={id:genId(),nome:slForm.nome.trim(),dataProd:slForm.dataProd,scadenza:scad.toISOString().slice(0,10),nota:slForm.nota,ingredienti:slForm.ingredienti.filter(x=>x.nome.trim()),lotto:"KP-"+Date.now().toString(36).toUpperCase(),createdAt:nowISO()};
                    saveList([item,...slList]);
                    setSlForm({nome:"",dataProd:todayDate(),scadGiorni:"3",nota:"",ingredienti:[{nome:"",lotto:"",qty:"",unit:"kg"}]});
                    setShowForm(false);
                    toast("✓ Semilavorato salvato","success");
                  }} style={{flex:1,padding:"8px",borderRadius:9,border:"none",cursor:"pointer",background:t.gold,color:"#fff",fontFamily:"var(--mono)",fontSize:10,fontWeight:600}}>✓ Salva</button>
                  <button onClick={()=>setShowForm(false)} style={{flex:1,padding:"8px",borderRadius:9,border:"1px solid "+t.div,cursor:"pointer",background:"transparent",color:t.inkMuted,fontFamily:"var(--mono)",fontSize:10}}>Annulla</button>
                </div>
              </div>
            )}
            {slList.length===0&&!showForm&&<div style={{padding:"24px",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",textAlign:"center"}}>Nessun semilavorato registrato</div>}
            {slList.map((sl,si)=>(
              <div key={sl.id} style={{background:t.bgAlt,borderRadius:12,padding:"14px 16px",border:"1px solid "+t.div}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:14,color:t.ink,fontWeight:500}}>{sl.nome}</div>
                    <div className="mono" style={{fontSize:9,color:t.inkFaint,marginTop:3}}>Lotto: {sl.lotto} · Prod: {sl.dataProd} · Scad: {sl.scadenza}</div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setPrintItem(sl)} style={{padding:"5px 10px",borderRadius:7,border:"none",cursor:"pointer",background:t.secondary,color:"#fff",fontFamily:"var(--mono)",fontSize:9}}>🖨 Stampa</button>
                    <button onClick={()=>saveList(slList.filter((_,j)=>j!==si))} style={{padding:"5px 8px",borderRadius:7,border:"none",cursor:"pointer",background:t.accentGlow,color:t.danger,fontFamily:"var(--mono)",fontSize:9}}>✕</button>
                  </div>
                </div>
                {sl.ingredienti.length>0&&<div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:5}}>
                  {sl.ingredienti.map((ing,ii)=>(
                    <span key={ii} style={{padding:"3px 8px",borderRadius:5,background:t.bgCard,border:"1px solid "+t.div,fontFamily:"var(--mono)",fontSize:9,color:t.inkMuted}}>{ing.nome}{ing.lotto?" #"+ing.lotto:""} {ing.qty}{ing.unit}</span>
                  ))}
                </div>}
                {sl.nota&&<div style={{marginTop:6,fontSize:11,color:t.inkMuted,fontFamily:"var(--serif)",fontStyle:"italic"}}>{sl.nota}</div>}
              </div>
            ))}
            {printItem&&(
              <div style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
                <div style={{background:"#fff",borderRadius:12,padding:"24px",maxWidth:380,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
                  <div id="etichetta-print" style={{fontFamily:"'Times New Roman',serif",color:"#000",border:"2px solid #1a2744",borderRadius:8,padding:"16px 20px"}}>
                    <div style={{textAlign:"center",borderBottom:"1.5px solid #1a2744",paddingBottom:8,marginBottom:10}}>
                      <div style={{fontSize:11,letterSpacing:"0.15em",color:"#8B7536",fontFamily:"monospace"}}>KITCHEN PRO · SEMILAVORATO</div>
                      <div style={{fontSize:18,fontWeight:700,marginTop:4}}>{printItem.nome}</div>
                    </div>
                    <div style={{fontSize:11,lineHeight:1.8}}>
                      <div><b>Lotto:</b> {printItem.lotto}</div>
                      <div><b>Data produzione:</b> {printItem.dataProd}</div>
                      <div><b>Scadenza:</b> {printItem.scadenza}</div>
                      {printItem.ingredienti.length>0&&<div style={{marginTop:6}}><b>Ingredienti:</b><br/>{printItem.ingredienti.map((i,ii)=><span key={ii}>{i.nome}{i.lotto?" (lotto "+i.lotto+")":""}{i.qty?" "+i.qty+i.unit:""}{ii<printItem.ingredienti.length-1?", ":""}</span>)}</div>}
                      {printItem.nota&&<div style={{marginTop:6,fontStyle:"italic"}}>{printItem.nota}</div>}
                    </div>
                    <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid #1a2744",fontSize:9,color:"#666",textAlign:"right",fontFamily:"monospace"}}>Kitchen Pro · {kitchen?.name||""}</div>
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:14}}>
                    <button onClick={()=>window.print()} style={{flex:1,padding:"9px",borderRadius:9,border:"none",cursor:"pointer",background:"#1a2744",color:"#C9A84C",fontFamily:"monospace",fontSize:11,fontWeight:600}}>🖨 Stampa</button>
                    <button onClick={()=>setPrintItem(null)} style={{flex:1,padding:"9px",borderRadius:9,border:"1px solid #ccc",cursor:"pointer",background:"transparent",color:"#666",fontFamily:"monospace",fontSize:11}}>Chiudi</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
"""

lines.insert(ia_tab_i, semilav_block)
print(f"✓ blocco semilavorati inserito prima di tab ia (riga {ia_tab_i+1})")

open(SRC, "w", encoding="utf-8").writelines(lines)
print("DONE")
