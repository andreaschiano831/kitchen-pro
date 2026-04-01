SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
txt = open(SRC, encoding="utf-8").read()

comp = r'''function PerFornitoireView({ t, items, spesaV2Add, spesaV2Toggle, spesaV2Remove, spesaV2Update, toast, canEdit }) {
  const byFornitore:{[k:string]:any[]} = {};
  items.forEach((item:any)=>{
    const k = item.fornitore||"Senza fornitore";
    if(!byFornitore[k]) byFornitore[k]=[];
    byFornitore[k].push(item);
  });
  const fornitori = Object.keys(byFornitore).sort();
  const [expanded, setExpanded] = React.useState<string|null>(null);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {items.length===0&&<div style={{padding:"32px",textAlign:"center",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic"}}>Nessun articolo in lista</div>}
      {fornitori.map((forn:string)=>{
        const isOpen=expanded===forn;
        const fornitoreItems=byFornitore[forn];
        const tot=fornitoreItems.filter((x:any)=>!x.checked).length;
        return (
          <div key={forn} style={{borderRadius:12,border:"1px solid "+t.div,overflow:"hidden"}}>
            <div onClick={()=>setExpanded(isOpen?null:forn)} style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",background:isOpen?t.bgAlt:t.bgCard}}>
              <span style={{fontSize:16}}>🏪</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:14,color:t.ink,fontWeight:500}}>{forn}</div>
                <div className="mono" style={{fontSize:9,color:t.inkFaint,marginTop:2}}>{tot} articoli da ordinare · {fornitoreItems.length} totali</div>
              </div>
              <span style={{fontSize:11,color:t.inkFaint}}>{isOpen?"▲":"▼"}</span>
            </div>
            {isOpen&&(
              <div style={{padding:"8px 16px 12px",display:"flex",flexDirection:"column",gap:2}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <div className="mono" style={{fontSize:8,color:t.inkFaint,letterSpacing:"0.1em"}}>GIORNALIERO</div>
                  <div className="mono" style={{fontSize:8,color:t.inkFaint,letterSpacing:"0.1em"}}>SETTIMANALE</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div>
                    {fornitoreItems.filter((x:any)=>x.frequenza==="giornaliero").map((item:any)=>(
                      <div key={item.id} style={{padding:"4px 0",display:"flex",alignItems:"center",gap:6,opacity:item.checked?0.4:1}}>
                        <input type="checkbox" checked={!!item.checked} onChange={()=>spesaV2Toggle(item.id)} style={{cursor:"pointer",accentColor:t.gold}}/>
                        <span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink,flex:1,textDecoration:item.checked?"line-through":"none"}}>{item.nome}</span>
                        <span className="mono" style={{fontSize:9,color:t.inkFaint}}>{item.quantita}{item.unitaMisura}</span>
                        {canEdit&&<button onClick={()=>spesaV2Remove(item.id)} style={{background:"none",border:"none",color:t.danger,cursor:"pointer",fontSize:12}}>✕</button>}
                      </div>
                    ))}
                    {fornitoreItems.filter((x:any)=>x.frequenza==="giornaliero").length===0&&<div style={{color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:11}}>—</div>}
                  </div>
                  <div>
                    {fornitoreItems.filter((x:any)=>x.frequenza==="settimanale").map((item:any)=>(
                      <div key={item.id} style={{padding:"4px 0",display:"flex",alignItems:"center",gap:6,opacity:item.checked?0.4:1}}>
                        <input type="checkbox" checked={!!item.checked} onChange={()=>spesaV2Toggle(item.id)} style={{cursor:"pointer",accentColor:t.gold}}/>
                        <span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink,flex:1,textDecoration:item.checked?"line-through":"none"}}>{item.nome}</span>
                        <span className="mono" style={{fontSize:9,color:t.inkFaint}}>{item.quantita}{item.unitaMisura}</span>
                        {canEdit&&<button onClick={()=>spesaV2Remove(item.id)} style={{background:"none",border:"none",color:t.danger,cursor:"pointer",fontSize:12}}>✕</button>}
                      </div>
                    ))}
                    {fornitoreItems.filter((x:any)=>x.frequenza==="settimanale").length===0&&<div style={{color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:11}}>—</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

'''
assert txt.count("function GiacenzaFornitori")==1
txt = txt.replace("function GiacenzaFornitori", comp+"function GiacenzaFornitori")
open(SRC, "w", encoding="utf-8").write(txt)
print("DONE")
