import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
BK  = SRC.replace(".tsx","_bk_export_"+datetime.datetime.now().strftime("%Y%m%d_%H%M%S")+".tsx")
shutil.copy2(SRC,BK); print("Backup ->",BK)

lines = open(SRC,encoding="utf-8").readlines()

# 1) Trova riga showAI state e aggiungi showExport dopo
show_ai_state = next(i for i,l in enumerate(lines) if "const [showAI" in l and "setShowAI" in l and "useState" in l)
lines.insert(show_ai_state+1, "  const [showExport, setShowExport] = useState(false);\n")
lines.insert(show_ai_state+2, "  const [expSections, setExpSections] = useState({giacenze:true,preparazioni:true,haccp:false});\n")
lines.insert(show_ai_state+3, "  const [expPartita, setExpPartita] = useState('tutti');\n")
print("Stati export aggiunti a riga", show_ai_state+2)

# 2) Trova LiveClock nell'header e aggiungi bottone export prima
liveclock_i = next(i for i,l in enumerate(lines) if "<LiveClock" in l and "t={t}" in l and i > 8000)
export_btn = '            <button onClick={()=>setShowExport(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:9,border:`1px solid ${t.div}`,cursor:"pointer",background:t.bgCard,color:t.inkMuted,fontFamily:"var(--mono)",fontSize:9}}><span>⬇</span><span>{isMobile?"":"Export"}</span></button>\n'
lines.insert(liveclock_i, export_btn)
print("Bottone export aggiunto a riga", liveclock_i+1)

# 3) Trova il modal showBriefing e aggiungi modal export prima
show_briefing_modal = next(i for i,l in enumerate(lines) if "showBriefing" in l and "BriefingPanel" in l)

export_modal = '''      {showExport&&(
        <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowExport(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:t.bgCard,borderRadius:16,padding:28,width:460,maxWidth:"95vw",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontFamily:"var(--serif)",fontSize:16,fontStyle:"italic",color:t.ink}}>⬇ Esporta Dati</div>
              <button onClick={()=>setShowExport(false)} style={{background:"none",border:"none",cursor:"pointer",color:t.inkFaint,fontSize:20}}>×</button>
            </div>
            <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:8,letterSpacing:"0.1em"}}>SEZIONI</div>
            <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
              {[{k:"giacenze",l:"Giacenze"},{k:"preparazioni",l:"Preparazioni"},{k:"haccp",l:"HACCP"}].map(({k,l})=>(
                <button key={k} onClick={()=>setExpSections((p:any)=>({...p,[k]:!p[k]}))}
                  style={{padding:"7px 14px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:9,
                    background:(expSections as any)[k]?`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`:t.bgAlt,
                    color:(expSections as any)[k]?"#fff":t.inkMuted}}>
                  {(expSections as any)[k]?"✓ ":""}{l}
                </button>
              ))}
            </div>
            <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:8,letterSpacing:"0.1em"}}>PARTITA</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
              {[{k:"tutti",l:"Tutte"},...STATIONS.filter((s:any)=>s.key!=="all").map((s:any)=>({k:s.key,l:s.icon+" "+s.label}))].map(({k,l})=>(
                <button key={k} onClick={()=>setExpPartita(k)}
                  style={{padding:"6px 12px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:9,
                    background:expPartita===k?t.gold:t.bgAlt,
                    color:expPartita===k?"#fff":t.inkMuted}}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={()=>{
              const rows:string[][] = [];
              const sep = ";";
              const allItems = [...(kitchen?.freezer||[]),...(kitchen?.fridge||[]),...(kitchen?.dry||[]),...(kitchen?.counter||[])];
              const filtItems = expPartita==="tutti"?allItems:allItems.filter((x:any)=>x.partita===expPartita);
              if((expSections as any).giacenze){
                rows.push(["GIACENZE","","","","","","",""]);
                rows.push(["Nome","Categoria","Partita","Lotto","Data Produzione","Scadenza","Giacenza","Unita"]);
                filtItems.forEach((x:any)=>rows.push([x.name||"",x.category||"",x.partita||"",x.lot||"",x.insertedDate||"",x.expiresAt?x.expiresAt.slice(0,10):"",String(x.quantity||0),x.unit||""]));
                rows.push([""]);
              }
              if((expSections as any).preparazioni){
                const preps = expPartita==="tutti"?(kitchen?.preparazioni||[]):(kitchen?.preparazioni||[]).filter((p:any)=>p.partita===expPartita||p.reparto===expPartita);
                rows.push(["PREPARAZIONI","","","","",""]);
                rows.push(["Nome","Partita","Stato","Quantita","Unita","Scadenza"]);
                preps.forEach((p:any)=>rows.push([p.nome||"",p.partita||p.reparto||"",p.status||"",String(p.quantita||0),p.unitaMisura||"",p.scadeIl?p.scadeIl.slice(0,10):""]));
                rows.push([""]);
              }
              if((expSections as any).haccp){
                const hLogs:any[] = JSON.parse(localStorage.getItem("hlog-"+kitchen?.id)||"[]");
                const filtLogs = expPartita==="tutti"?hLogs:hLogs;
                rows.push(["HACCP TEMPERATURE","","","",""]);
                rows.push(["Zona","Temperatura","Operatore","Data Ora","Conforme"]);
                filtLogs.forEach((l:any)=>rows.push([l.zona||"",String(l.temp||0),l.op||"",l.at?l.at.slice(0,16).replace("T"," "):"",l.ok?"SI":"NO"]));
              }
              const csv = rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(sep)).join("\n");
              const a = document.createElement("a");
              a.href = "data:text/csv;charset=utf-8,\uFEFF"+encodeURIComponent(csv);
              a.download = "kitchenpro-export-"+new Date().toISOString().slice(0,10)+".csv";
              a.click();
              setShowExport(false);
            }} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",cursor:"pointer",
              background:`linear-gradient(135deg,${t.gold},${t.goldBright})`,color:"#fff",
              fontFamily:"var(--mono)",fontSize:11,letterSpacing:"0.06em"}}>
              ⬇ Scarica CSV (Excel)
            </button>
          </div>
        </div>
      )}
'''
lines.insert(show_briefing_modal, export_modal)
print("Modal export aggiunto")

open(SRC,"w",encoding="utf-8").writelines(lines)
print("OK")
