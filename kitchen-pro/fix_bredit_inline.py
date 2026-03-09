import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
BK  = SRC.replace(".tsx","_bk_inline_"+datetime.datetime.now().strftime("%Y%m%d_%H%M%S")+".tsx")
shutil.copy2(SRC,BK); print("Backup ->",BK)

lines = open(SRC,encoding="utf-8").readlines()

# Verifica righe
print("1837:", lines[1836].strip())  # {result&&(
print("1868:", lines[1867].strip())  # <div style gap:8 = bottoni

# Sostituisci righe 1837-1867 (idx 1836-1866) con versione editabile inline
new_block = r"""        {result&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{padding:"16px 20px",borderRadius:12,background:`linear-gradient(135deg,${t.secondary}22,${t.bgAlt})`,border:`1px solid ${t.secondary}44`}}>
              <input value={result.intestazione||""} onChange={e=>setResult((r:any)=>({...r,intestazione:e.target.value}))}
                style={{width:"100%",fontFamily:"var(--serif)",fontSize:15,fontStyle:"italic",color:t.ink,lineHeight:1.5,background:"transparent",border:"none",outline:"none"}}/>
            </div>
            <div>
              <div className="mono" style={{fontSize:9,color:t.inkFaint,marginBottom:8}}>PRIORITA DEL GIORNO</div>
              {(result.priorita_giornaliere||[]).map((p:any,i:number)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"center",marginBottom:4}}>
                  <span className="mono" style={{color:t.gold,flexShrink:0,minWidth:18}}>{i+1}.</span>
                  <input value={p} onChange={e=>{const arr=[...(result.priorita_giornaliere||[])];arr[i]=e.target.value;setResult((r:any)=>({...r,priorita_giornaliere:arr}));}}
                    style={{flex:1,padding:"6px 10px",borderRadius:8,border:`1px solid ${t.div}`,background:t.bgAlt,color:t.ink,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,outline:"none"}}/>
                  <button onClick={()=>{const arr=(result.priorita_giornaliere||[]).filter((_:any,j:number)=>j!==i);setResult((r:any)=>({...r,priorita_giornaliere:arr}));}} style={{padding:"2px 8px",borderRadius:5,border:"none",cursor:"pointer",background:t.accentGlow,color:t.danger,fontSize:10}}>x</button>
                </div>
              ))}
              <button onClick={()=>setResult((r:any)=>({...r,priorita_giornaliere:[...(r.priorita_giornaliere||[]),""]}))}
                style={{padding:"4px 12px",borderRadius:7,border:`1px dashed ${t.div}`,background:"transparent",color:t.inkFaint,fontFamily:"var(--mono)",fontSize:9,cursor:"pointer",marginTop:4}}>+ Aggiungi priorita</button>
            </div>
            {(result.mep_urgente||[]).length>0&&<div>
              <div className="mono" style={{fontSize:9,color:t.inkFaint,marginBottom:8}}>MEP URGENTE</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {(result.mep_urgente||[]).map((m:any,i:number)=>(
                  <div key={i} style={{display:"flex",gap:6,alignItems:"center"}}>
                    <input value={m.nome||""} onChange={e=>{const arr=[...(result.mep_urgente||[])];arr[i]={...arr[i],nome:e.target.value};setResult((r:any)=>({...r,mep_urgente:arr}));}}
                      style={{flex:2,padding:"5px 8px",borderRadius:7,border:`1px solid ${t.goldDim}`,background:t.goldFaint,color:t.ink,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,outline:"none"}}/>
                    <input value={m.da_fare_entro||""} onChange={e=>{const arr=[...(result.mep_urgente||[])];arr[i]={...arr[i],da_fare_entro:e.target.value};setResult((r:any)=>({...r,mep_urgente:arr}));}}
                      style={{flex:1,padding:"5px 8px",borderRadius:7,border:`1px solid ${t.goldDim}`,background:t.goldFaint,color:t.gold,fontFamily:"var(--mono)",fontSize:9,outline:"none"}}/>
                    <button onClick={()=>{const arr=(result.mep_urgente||[]).filter((_:any,j:number)=>j!==i);setResult((r:any)=>({...r,mep_urgente:arr}));}} style={{padding:"2px 8px",borderRadius:5,border:"none",cursor:"pointer",background:t.accentGlow,color:t.danger,fontSize:10}}>x</button>
                  </div>
                ))}
              </div>
            </div>}
            {(result.allerte_haccp||[]).length>0&&<div style={{padding:"12px 16px",borderRadius:10,background:t.accentGlow,border:`1px solid ${t.danger}44`}}>
              <div className="mono" style={{fontSize:9,color:t.danger,marginBottom:6}}>ALLERTE HACCP</div>
              {(result.allerte_haccp||[]).map((a:any,i:number)=>(
                <div key={i} style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                  <input value={a} onChange={e=>{const arr=[...(result.allerte_haccp||[])];arr[i]=e.target.value;setResult((r:any)=>({...r,allerte_haccp:arr}));}}
                    style={{flex:1,padding:"4px 8px",borderRadius:6,border:`1px solid ${t.danger}44`,background:"transparent",color:t.danger,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,outline:"none"}}/>
                  <button onClick={()=>{const arr=(result.allerte_haccp||[]).filter((_:any,j:number)=>j!==i);setResult((r:any)=>({...r,allerte_haccp:arr}));}} style={{padding:"2px 8px",borderRadius:5,border:"none",cursor:"pointer",background:t.accentGlow,color:t.danger,fontSize:10}}>x</button>
                </div>
              ))}
            </div>}
            <div style={{padding:"14px 18px",borderRadius:10,background:t.bgAlt,borderLeft:`4px solid ${t.gold}`}}>
              <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:4}}>NOTA CHEF</div>
              <textarea value={result.nota_chef||""} onChange={e=>setResult((r:any)=>({...r,nota_chef:e.target.value}))}
                style={{width:"100%",fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,color:t.ink,lineHeight:1.6,background:"transparent",border:"none",outline:"none",resize:"none",minHeight:60}}/>
            </div>
"""

new_lines = [l+"\n" for l in new_block.split("\n")]

# Trova inizio e fine del blocco da sostituire
start_i = 1836  # {result&&(
end_i = 1867    # <div style gap:8 bottoni (esclusa)

print(f"Sostituisco righe {start_i+1}-{end_i}")
lines[start_i:end_i] = new_lines

open(SRC,"w",encoding="utf-8").writelines(lines)
print("OK")
