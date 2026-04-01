SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
txt = open(SRC, encoding="utf-8").read()

comp = r'''function GiacenzaFornitori({ t, spesaV2Add, toast, items }) {
  const { kitchen } = useK();
  const ingredienti = kitchen?.ingredienti||[];
  const [expanded, setExpanded] = React.useState<string|null>(null);
  const [search, setSearch] = React.useState("");

  // Raggruppa per fornitore
  const byFornitore:{[k:string]:any[]} = {};
  ingredienti.forEach((ing:any)=>{
    const k = ing.fornitore||"Fornitore sconosciuto";
    if(!byFornitore[k]) byFornitore[k]=[];
    byFornitore[k].push(ing);
  });

  const allIngr = ingredienti.filter((i:any)=>!search||i.nome.toLowerCase().includes(search.toLowerCase()));

  function inStock(nome:string) {
    return (items||[]).find((x:any)=>x.name.toLowerCase().includes(nome.toLowerCase().split(" ")[0]));
  }

  function aggiungiASpesa(ing:any) {
    spesaV2Add(ing.nome, ing.qty||1, ing.unit||"pz", "alimenti", "giornaliero", ing.lotto?"lotto:"+ing.lotto:"");
    toast("+ "+ing.nome+" in lista spesa","success");
  }

  const fornitori = Object.keys(byFornitore).sort();

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca ingrediente..." style={{flex:1,minWidth:120,padding:"8px 12px",borderRadius:9,border:"1px solid "+t.div,background:t.bgCard,color:t.ink,fontFamily:"var(--serif)",fontSize:13,outline:"none"}}/>
        <span className="mono" style={{fontSize:9,color:t.inkFaint}}>{ingredienti.length} ingredienti</span>
      </div>
      {ingredienti.length===0&&<div style={{padding:"32px",textAlign:"center",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic"}}>Carica una fattura per vedere gli ingredienti</div>}
      {search ? (
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {allIngr.map((ing:any)=>{
            const stock=inStock(ing.nome);
            const sotto=stock&&stock.quantity<(stock.parLevel||0);
            return (
              <div key={ing.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",borderRadius:10,background:t.bgAlt,border:"1px solid "+(sotto?t.danger:t.div)}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,color:t.ink}}>{ing.nome}</div>
                  <div className="mono" style={{fontSize:9,color:t.inkFaint,marginTop:2,display:"flex",flexWrap:"wrap",gap:6}}>
                    <span style={{color:t.secondary}}>{ing.fornitore}</span>
                    <span>{ing.qty} {ing.unit}</span>
                    {ing.lotto&&<span style={{color:t.gold}}>#{ing.lotto}</span>}
                    {ing.scadenza&&<span>scad:{ing.scadenza}</span>}
                    {sotto&&<span style={{color:t.danger,fontWeight:700}}>SOTTO PAR</span>}
                  </div>
                </div>
                <button onClick={()=>aggiungiASpesa(ing)} style={{padding:"5px 10px",borderRadius:7,border:"none",cursor:"pointer",background:t.gold,color:"#fff",fontFamily:"var(--mono)",fontSize:9}}>+ Spesa</button>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {fornitori.map((forn:string)=>{
            const ings=byFornitore[forn];
            const isOpen=expanded===forn;
            const tot=ings.reduce((s:number,i:any)=>s+(i.prezzoTotale||0),0);
            return (
              <div key={forn} style={{borderRadius:12,border:"1px solid "+t.div,overflow:"hidden"}}>
                <div onClick={()=>setExpanded(isOpen?null:forn)} style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",background:isOpen?t.bgAlt:t.bgCard}}>
                  <span style={{fontSize:16}}>🏪</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:14,color:t.ink,fontWeight:500}}>{forn}</div>
                    <div className="mono" style={{fontSize:9,color:t.inkFaint,marginTop:2}}>{ings.length} ingredienti{tot>0?" · €"+tot.toFixed(2):""}</div>
                  </div>
                  <span style={{fontSize:11,color:t.inkFaint}}>{isOpen?"▲":"▼"}</span>
                </div>
                {isOpen&&(
                  <div style={{padding:"8px 12px 12px",display:"flex",flexDirection:"column",gap:6}}>
                    {ings.map((ing:any)=>{
                      const stock=inStock(ing.nome);
                      const sotto=stock&&stock.quantity<(stock.parLevel||0);
                      return (
                        <div key={ing.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:t.bgCard,border:"1px solid "+(sotto?t.danger+"44":t.div)}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink}}>{ing.nome}</div>
                            <div className="mono" style={{fontSize:9,color:t.inkFaint,marginTop:2,display:"flex",flexWrap:"wrap",gap:5}}>
                              <span>{ing.qty} {ing.unit}</span>
                              {ing.lotto&&<span style={{color:t.gold}}>#{ing.lotto}</span>}
                              {ing.scadenza&&<span>scad:{ing.scadenza}</span>}
                              {ing.prezzoUnitario&&<span style={{color:t.success}}>€{ing.prezzoUnitario}/{ing.unit}</span>}
                              {sotto&&<span style={{color:t.danger,fontWeight:700}}>SOTTO PAR</span>}
                            </div>
                          </div>
                          <button onClick={()=>aggiungiASpesa(ing)} style={{padding:"4px 8px",borderRadius:6,border:"none",cursor:"pointer",background:t.gold,color:"#fff",fontFamily:"var(--mono)",fontSize:8,whiteSpace:"nowrap"}}>+ Spesa</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'''

assert txt.count("function ArchivioFatture")==1
txt = txt.replace("function ArchivioFatture", comp+"function ArchivioFatture")
open(SRC, "w", encoding="utf-8").write(txt)
print("DONE")
