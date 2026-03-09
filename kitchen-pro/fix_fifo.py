import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
BK  = SRC.replace(".tsx","_bk_fifo_"+datetime.datetime.now().strftime("%Y%m%d_%H%M%S")+".tsx")
shutil.copy2(SRC,BK); print("Backup ->",BK)
txt = open(SRC,encoding="utf-8").read()

# ── FIX 1: aggiungi 3 state vars dopo groupByCat ──
old1 = "  const [groupByCat, setGroupByCat] = useState(true);"
new1 = """  const [groupByCat, setGroupByCat] = useState(true);
  const [collapsedPartite, setCollapsedPartite] = useState<string[]>([]);
  const [collapsedCats, setCollapsedCats] = useState<string[]>([]);
  const [collapsedProds, setCollapsedProds] = useState<string[]>([]);"""
assert txt.count(old1)==1, f"FIX1: {txt.count(old1)}"
txt = txt.replace(old1,new1)
print("OK fix1")

# ── FIX 2: sostituisci il blocco groupByCat true-branch ──
OLD_START = """        groupByCat ? (
          /* ── Vista raggruppata ── */
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {(()=>{
              const grouped = Object.entries(
                items.reduce((acc:any,item:any)=>{
                  const cat=item.category||"secco";
                  if(!acc[cat]) acc[cat]=[];
                  acc[cat].push(item); return acc;
                },{})
              ).sort(([a],[b])=>(Object.keys(CATEGORIES).indexOf(a)||99)-(Object.keys(CATEGORIES).indexOf(b)||99));
              return grouped.map(([cat,catItems]:any)=>(
                <div key={cat} style={{marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,
                    padding:"8px 12px",borderRadius:10,
                    background:`linear-gradient(135deg,${t.gold}10,${t.bgAlt})`,
                    border:`1px solid ${t.gold}30`}}>
                    <span style={{fontSize:18}}>{CATEGORIES[cat]?.icon||"·"}</span>
                    <span className="mono" style={{fontSize:9,letterSpacing:"0.14em",color:t.gold,flex:1}}>
                      {(CATEGORIES[cat]?.label||cat).toUpperCase()}
                    </span>
                    <span className="mono" style={{fontSize:9,color:t.inkFaint}}>{(catItems as any[]).length} art.</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                    {(catItems as any[]).map((item:any,idx:number)=>{"""

assert txt.count(OLD_START)==1, f"OLD_START: {txt.count(OLD_START)}"

OLD_END = """            })()}
          </div>
        ) : (
          /* Vista flat */"""

assert txt.count(OLD_END)==1, f"OLD_END: {txt.count(OLD_END)}"

idx_start = txt.index(OLD_START)
idx_end   = txt.index(OLD_END) + len(OLD_END)
old_block = txt[idx_start:idx_end]

NEW_BLOCK = """        groupByCat ? (
          /* ── Vista Partita → Categoria → Prodotto → Lotti FIFO ── */
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {(()=>{
              const PARTITE_ORDER=STATIONS.filter((s:any)=>s.key!=="all").map((s:any)=>s.key);
              const byPartita:Record<string,any[]>={};
              items.forEach((item:any)=>{const p=item.partita||"—";if(!byPartita[p])byPartita[p]=[];byPartita[p].push(item);});
              const partiteEntries=Object.entries(byPartita).sort(([a],[b])=>{const ia=PARTITE_ORDER.indexOf(a),ib=PARTITE_ORDER.indexOf(b);return(ia===-1?99:ia)-(ib===-1?99:ib);});
              return partiteEntries.map(([partita,partitaItems])=>{
                const partitaOpen=!collapsedPartite.includes(partita);
                const station=(STATIONS as any[]).find((s:any)=>s.key===partita);
                const byCategory:Record<string,any[]>={};
                (partitaItems as any[]).forEach((item:any)=>{const c=item.category||"secco";if(!byCategory[c])byCategory[c]=[];byCategory[c].push(item);});
                const catEntries=Object.entries(byCategory).sort(([a],[b])=>(Object.keys(CATEGORIES).indexOf(a)||99)-(Object.keys(CATEGORIES).indexOf(b)||99));
                return (
                  <div key={partita} style={{marginBottom:16}}>
                    {/* PARTITA HEADER */}
                    <div onClick={()=>setCollapsedPartite((p:string[])=>p.includes(partita)?p.filter((x:string)=>x!==partita):[...p,partita])}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:12,
                        background:`linear-gradient(135deg,${t.secondary}18,${t.bgAlt})`,
                        border:`1px solid ${t.secondary}30`,cursor:"pointer",marginBottom:partitaOpen?10:0}}>
                      <span style={{fontSize:18}}>{station?.icon||"🍽"}</span>
                      <span className="mono" style={{fontSize:10,letterSpacing:"0.14em",color:t.secondary,flex:1}}>
                        {(station?.label||partita).toUpperCase()}
                      </span>
                      <span className="mono" style={{fontSize:9,color:t.inkFaint}}>{(partitaItems as any[]).length} art.</span>
                      <span style={{color:t.inkFaint,fontSize:11}}>{partitaOpen?"▲":"▼"}</span>
                    </div>
                    {partitaOpen&&catEntries.map(([cat,catItems])=>{
                      const catKey=partita+":"+cat;
                      const catOpen=!collapsedCats.includes(catKey);
                      const byName:Record<string,any[]>={};
                      (catItems as any[]).forEach((item:any)=>{const k=item.name.trim().toLowerCase();if(!byName[k])byName[k]=[];byName[k].push(item);});
                      Object.values(byName).forEach((arr:any[])=>arr.sort((a,b)=>{if(!a.expiresAt&&!b.expiresAt)return 0;if(!a.expiresAt)return 1;if(!b.expiresAt)return -1;return new Date(a.expiresAt).getTime()-new Date(b.expiresAt).getTime();}));
                      const nameEntries=Object.entries(byName);
                      return (
                        <div key={cat} style={{marginBottom:10}}>
                          {/* CATEGORIA HEADER */}
                          <div onClick={()=>setCollapsedCats((p:string[])=>p.includes(catKey)?p.filter((x:string)=>x!==catKey):[...p,catKey])}
                            style={{display:"flex",alignItems:"center",gap:10,marginBottom:catOpen?8:0,
                              padding:"7px 12px",borderRadius:10,
                              background:`linear-gradient(135deg,${t.gold}10,${t.bgAlt})`,
                              border:`1px solid ${t.gold}30`,cursor:"pointer"}}>
                            <span style={{fontSize:16}}>{(CATEGORIES as any)[cat]?.icon||"·"}</span>
                            <span className="mono" style={{fontSize:9,letterSpacing:"0.14em",color:t.gold,flex:1}}>
                              {((CATEGORIES as any)[cat]?.label||cat).toUpperCase()}
                            </span>
                            <span className="mono" style={{fontSize:9,color:t.inkFaint}}>{(catItems as any[]).length} art.</span>
                            <span style={{color:t.inkFaint,fontSize:10}}>{catOpen?"▲":"▼"}</span>
                          </div>
                          {catOpen&&(
                            <div style={{display:"flex",flexDirection:"column",gap:8}}>
                              {nameEntries.map(([nameKey,lots])=>{
                                const prodKey=partita+":"+cat+":"+nameKey;
                                const prodOpen=!collapsedProds.includes(prodKey);
                                const firstLot=(lots as any[])[0];
                                const totalQty=(lots as any[]).reduce((s:number,x:any)=>s+(x.quantity||0),0);
                                const badge=expiryBadge(firstLot.expiresAt);
                                const par=firstLot.parLevel??PAR_PRESET[firstLot.category]??0;
                                const isLow=par>0&&totalQty<par;
                                return (
                                  <div key={nameKey} style={{
                                    background:t.bgCard,borderRadius:12,overflow:"hidden",
                                    border:`1px solid ${badge&&(badge as any).bg==="#8B1E2F"?t.accent+"40":t.div}`,
                                    boxShadow:badge?`0 4px 20px ${t.accentGlow}`:`0 1px 6px ${t.shadow}`,
                                    transition:"all 0.3s",
                                  }}>
                                    {firstLot.expiresAt&&(()=>{const h=hoursUntil(firstLot.expiresAt);const maxH=72;const pct=h===null?100:Math.min(Math.max((1-h/maxH)*100,0),100);const barColor=!h||h<=0?t.danger:h<=24?t.danger:h<=72?t.warning:t.success;return <div style={{height:3,background:t.bgAlt}}><div style={{height:"100%",width:`${pct}%`,background:barColor,transition:"width 1s"}}/></div>;})()}
                                    {/* PRODOTTO HEADER */}
                                    <div onClick={()=>setCollapsedProds((p:string[])=>p.includes(prodKey)?p.filter((x:string)=>x!==prodKey):[...p,prodKey])}
                                      style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                                      <div style={{flex:1,minWidth:0}}>
                                        <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:14,color:t.ink,fontWeight:500}}>{firstLot.name}</div>
                                        <div className="mono" style={{fontSize:8,color:t.inkFaint,marginTop:2}}>
                                          {(lots as any[]).length} lott{(lots as any[]).length===1?"o":"i"} · tot. {totalQty} {firstLot.unit}
                                          {firstLot.expiresAt&&` · primo scad. ${fmtDate(firstLot.expiresAt)}`}
                                        </div>
                                      </div>
                                      <div style={{textAlign:"right",flexShrink:0}}>
                                        <span style={{fontSize:22,fontWeight:300,fontFamily:"var(--serif)",color:isLow?t.danger:t.ink,lineHeight:1}}>{totalQty}</span>
                                        <span className="mono" style={{fontSize:9,color:t.inkFaint,display:"block"}}>{firstLot.unit}</span>
                                      </div>
                                      <span style={{color:t.inkFaint,fontSize:11,marginLeft:6}}>{prodOpen?"▲":"▼"}</span>
                                    </div>
                                    {(badge||isLow)&&<div style={{padding:"0 16px 8px",display:"flex",gap:6,flexWrap:"wrap"}}>
                                      {badge&&<Badge label={(badge as any).label} color={(badge as any).color} bg={(badge as any).bg}/>}
                                      {isLow&&<Badge label="↓ SCORTA" color={t.warning} bg={t.goldFaint}/>}
                                    </div>}
                                    {/* LOTTI FIFO */}
                                    {prodOpen&&(
                                      <div style={{borderTop:`1px solid ${t.div}`}}>
                                        {(lots as any[]).map((item:any,li:number)=>{
                                          const [sm,lg]=stepFor(item.unit);
                                          const ltBadge=expiryBadge(item.expiresAt);
                                          return (
                                            <div key={item.id} style={{
                                              padding:"10px 16px",
                                              borderBottom:li<(lots as any[]).length-1?`1px solid ${t.div}40`:"none",
                                              background:li===0?`${t.gold}08`:"transparent",
                                            }}>
                                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                                                {li===0&&<span className="mono" style={{fontSize:7,padding:"2px 5px",borderRadius:4,background:t.gold,color:"#fff",flexShrink:0}}>FIFO</span>}
                                                <span className="mono" style={{fontSize:9,color:t.inkSoft,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                                  {item.lot||"—"}{item.expiresAt&&` · Scad. ${fmtDate(item.expiresAt)}`}
                                                </span>
                                                <span style={{fontFamily:"var(--serif)",fontSize:16,color:item.quantity<=0?t.danger:t.ink,flexShrink:0}}>{item.quantity}</span>
                                                <span className="mono" style={{fontSize:8,color:t.inkFaint,flexShrink:0}}>{item.unit}</span>
                                                {ltBadge&&<Badge label={(ltBadge as any).label} color={(ltBadge as any).color} bg={(ltBadge as any).bg}/>}
                                              </div>
                                              {canEdit&&(
                                                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                                                  <button onClick={()=>adjustItem(item.id,-sm)} style={btnSmall(t)}>−{sm}</button>
                                                  <button onClick={()=>adjustItem(item.id,-lg)} style={btnSmall(t)}>−{lg}</button>
                                                  <button onClick={()=>adjustItem(item.id,+sm)} style={{...btnSmall(t),background:t.success+"20",color:t.success}}>+{sm}</button>
                                                  <button onClick={()=>adjustItem(item.id,+lg)} style={{...btnSmall(t),background:t.success+"20",color:t.success}}>+{lg}</button>
                                                  <button onClick={()=>{setMoveModal(item);setMoveQty(String(item.quantity));setMoveDest(item.location==="freezer"?"fridge":"counter");}} style={{...btnSmall(t),background:"#2A4FA520",color:"#2A4FA5",fontSize:8}}>↗ Sposta</button>
                                                  <div style={{flex:1}}/>
                                                  <button onClick={()=>{if(confirm(`Rimuovi ${item.name}?`))removeItem(item.id);}} style={{...btnSmall(t),background:t.accentGlow,color:t.danger}}>✕</button>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                        {canEdit&&(
                                          <div style={{padding:"8px 16px",borderTop:`1px solid ${t.div}40`}}>
                                            <button onClick={()=>{setFName(firstLot.name);setFCat(firstLot.category||"proteine");setFPartita(firstLot.partita||"");setShowForm(true);window.scrollTo({top:0,behavior:"smooth"});}}
                                              style={{width:"100%",padding:"6px",borderRadius:8,border:`1px dashed ${t.gold}60`,background:"transparent",color:t.gold,fontFamily:"var(--mono)",fontSize:9,cursor:"pointer"}}>
                                              + Nuovo lotto
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          /* Vista flat */"""

assert txt.count(old_block)==1, f"OLD_BLOCK: {txt.count(old_block)}"
txt = txt.replace(old_block, NEW_BLOCK)
print("OK fix2")

open(SRC,"w",encoding="utf-8").write(txt)
print("Tutti i fix applicati")
