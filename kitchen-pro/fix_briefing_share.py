import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
BK  = SRC.replace(".tsx","_bk_share2_"+datetime.datetime.now().strftime("%Y%m%d_%H%M%S")+".tsx")
shutil.copy2(SRC,BK); print("Backup ->",BK)

txt = open(SRC,encoding="utf-8").read()

old = '            <button onClick={generate} style={{padding:"10px",borderRadius:10,border:`1px solid ${t.div}`,cursor:"pointer",background:"transparent",color:t.inkMuted,fontFamily:"var(--mono)",fontSize:10}}>↺ Rigenera</button>'

new = '''            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={generate} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${t.div}`,cursor:"pointer",background:"transparent",color:t.inkMuted,fontFamily:"var(--mono)",fontSize:10}}>↺ Rigenera</button>
              <button onClick={()=>{
                const lines=[result.intestazione,"","🎯 PRIORITÀ:",...(result.priorita_giornaliere||[]).map((p,i)=>`${i+1}. ${p}`),...(result.mep_urgente?.length?["","⏱ MEP URGENTE:",...result.mep_urgente.map(m=>`• ${m.nome}${m.da_fare_entro?" → "+m.da_fare_entro:""}")]:[]),...(result.allerte_haccp?.length?["","🛡 HACCP:",...result.allerte_haccp.map(a=>`• ${a}`)]:[]),...(result.nota_chef?["","📝 NOTA CHEF:",result.nota_chef]:[])].join("\\n");
                navigator.clipboard?.writeText(lines).then(()=>alert("Briefing copiato!"));
              }} style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${t.div}`,cursor:"pointer",background:"transparent",color:t.inkMuted,fontFamily:"var(--mono)",fontSize:10}}>📋 Copia</button>
              <button onClick={()=>{
                const lines=[result.intestazione,"","🎯 PRIORITÀ:",...(result.priorita_giornaliere||[]).map((p,i)=>`${i+1}. ${p}`),...(result.mep_urgente?.length?["","⏱ MEP URGENTE:",...result.mep_urgente.map(m=>`• ${m.nome}${m.da_fare_entro?" → "+m.da_fare_entro:""}")]:[]),...(result.allerte_haccp?.length?["","🛡 HACCP:",...result.allerte_haccp.map(a=>`• ${a}`)]:[]),...(result.nota_chef?["","📝 NOTA CHEF:",result.nota_chef]:[])].join("\\n");
                window.open("https://wa.me/?text="+encodeURIComponent(lines),"_blank");
              }} style={{padding:"10px 14px",borderRadius:10,border:"none",cursor:"pointer",background:"#25D36620",color:"#25D366",fontFamily:"var(--mono)",fontSize:10}}>💬 WhatsApp</button>
              <button onClick={()=>window.print()} style={{padding:"10px 14px",borderRadius:10,border:"none",cursor:"pointer",background:t.bgAlt,color:t.inkMuted,fontFamily:"var(--mono)",fontSize:10}}>🖨 Stampa</button>
            </div>'''

n = txt.count(old)
if n != 2:
    print("ERRORE - occorrenze:", n); exit(1)

# Sostituisci solo la seconda occorrenza
idx = txt.index(old, txt.index(old)+1)
txt = txt[:idx] + new + txt[idx+len(old):]

open(SRC,"w",encoding="utf-8").write(txt)
print("OK - share buttons aggiunti al BriefingPanel")
