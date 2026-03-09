#!/usr/bin/env python3
"""
fix_pending_flow.py
===================
Fix chirurgici per il flusso pendingOps in KitchenPro.tsx.

PROBLEMI:
  A) ops.map() nel bottone Conferma → crash (variabile inesistente)
  B) Parser +/- esegue stockAdd() direttamente → bypassa conferma
  C) Parser aggiungi multi-item esegue stockAdd() direttamente → bypassa conferma
  D) Parser aggiungi single-item esegue stockAdd() direttamente → bypassa conferma

DOPO IL FIX:
  - Tutti i parser popolano setPendingOps([...]) e mostrano la UI di conferma
  - L'utente vede la tabella, può modificare nome/qty/unit/loc e poi clicca Conferma
  - Il bottone Conferma usa pendingOps (corretto) e mostra recap dettagliato
"""

from pathlib import Path
import sys

FILE = Path("/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx")

if not FILE.exists():
    print(f"ERRORE: file non trovato: {FILE}")
    sys.exit(1)

src = FILE.read_text(encoding="utf-8")
original = src

fixes = []

# ─────────────────────────────────────────────────────────────────────────────
# FIX A: Bottone Conferma — ops.map → pendingOps + recap dettagliato
# ─────────────────────────────────────────────────────────────────────────────
OLD_A = '''            <button onClick={()=>{
              pendingOps.forEach(op=>{
                if(op.type==="add") stockAdd({name:op.name,quantity:op.qty,unit:op.unit,location:op.loc,insertedDate:todayDate()});
                else { const f=allItems().find(x=>x.name.toLowerCase().includes(op.name.toLowerCase())); if(f) adjustItem(f.id,-op.qty); }
              });
              const recap=ops.map((op:any)=>op.type==="add"?"+ "+op.name+" ("+op.qty+" "+op.unit+") "+op.loc:"- scalato "+op.name).join("\\n");
              setMessages(p=>[...p,{role:"ai",text:recap}]);
              setPendingOps(null);
            }} style={{flex:1,padding:"7px",borderRadius:8,border:"none",cursor:"pointer",background:t.gold,color:"#fff",fontFamily:"var(--mono)",fontSize:10,fontWeight:600}}>✓ Conferma</button>'''

NEW_A = '''            <button onClick={()=>{
              const locLabel:{[k:string]:string}={fridge:"Frigo",freezer:"Freezer",dry:"Dispensa",counter:"Banco"};
              const recap:string[]=[];
              pendingOps.forEach(op=>{
                if(op.type==="add"){
                  stockAdd({name:op.name,quantity:op.qty,unit:op.unit,location:op.loc,lot:op.lot,insertedDate:todayDate()});
                  recap.push(`✓ ${op.name} · ${op.qty} ${op.unit} → ${locLabel[op.loc]||op.loc}`);
                } else {
                  const f=allItems().find(x=>x.name.toLowerCase().includes(op.name.toLowerCase()));
                  if(f){ adjustItem(f.id,-op.qty); recap.push(`✓ Scalati ${op.qty}${op.unit} da ${f.name}`); }
                  else recap.push(`✗ Non trovato: ${op.name}`);
                }
              });
              setMessages(p=>[...p,{role:"ai",text:recap.join("\\n")||"✓ Operazioni applicate"}]);
              setPendingOps(null);
            }} style={{flex:1,padding:"7px",borderRadius:8,border:"none",cursor:"pointer",background:t.gold,color:"#fff",fontFamily:"var(--mono)",fontSize:10,fontWeight:600}}>✅ Applica</button>'''

fixes.append(("FIX A — bottone Conferma: ops → pendingOps + recap", OLD_A, NEW_A))

# ─────────────────────────────────────────────────────────────────────────────
# FIX B: Parser +/- → setPendingOps invece di stockAdd immediato
# ─────────────────────────────────────────────────────────────────────────────
OLD_B = '''      if(ops.length>0){
        const addedL:string[]=[], removedL:string[]=[], errL:string[]=[];
        ops.forEach(({sign,qty,unit,name,loc})=>{
          if(sign==="+"){
            stockAdd({name,quantity:qty,unit,location:loc,insertedDate:todayDate()});
            addedL.push(`+${qty}${unit} ${name} (${loc})`);
            ops_recap.push({type:'add',name,qty,unit,loc});
          } else {
            const found=items.find(x=>x.name.toLowerCase().includes(name.toLowerCase()));
            if(found){ adjustItem(found.id,-qty); removedL.push(`-${qty}${unit} ${name}`); }
            else errL.push(`✗ non trovato: ${name}`);
            ops_recap.push({type:'remove',name,qty,unit,loc:'?'});
          }
        });
        const parts=[];
        if(addedL.length) parts.push("✓ Aggiunti: "+addedL.join(", "));
        if(removedL.length) parts.push("✓ Rimossi/ridotti: "+removedL.join(", "));
        if(errL.length) parts.push(errL.join(", "));
        reply=parts.join("\\n");
        setMessages(p=>[...p,{role:"ai",text:reply||"✓ Operazioni eseguite",ops:ops_recap.length?ops_recap:undefined}]);
        return;
      }'''

NEW_B = '''      if(ops.length>0){
        const pendingList=ops.map(({sign,qty,unit,name,loc})=>({
          type:sign==="+"?"add":"remove",
          name,qty,unit,loc,
        }));
        setPendingOps(pendingList);
        setMessages(p=>[...p,{role:"ai",text:`⚡ ${pendingList.length} operazion${pendingList.length===1?"e":"i"} — verifica e conferma:`}]);
        return;
      }'''

fixes.append(("FIX B — parser +/- → setPendingOps", OLD_B, NEW_B))

# ─────────────────────────────────────────────────────────────────────────────
# FIX C: Parser aggiungi multi-item → setPendingOps invece di stockAdd immediato
# ─────────────────────────────────────────────────────────────────────────────
OLD_C = '''        const done:string[]=[];
        parts.forEach(part=>{
          const pm=part.toLowerCase().match(/(\\d+[\\.,]?\\d*)\\s*(pz|kg|g|ml|l)?\\s+(?:di\\s+)?([\\w\\s]+?)(?:\\s+(?:al|in)\\s+(frigo|frigorifico|freezer|congelatore|dispensa|banco))?\\s*$/);
          if(pm){const qty=parseFloat(pm[1].replace(",","."));
            const name=pm[3].trim().replace(/\\b(un|una|il|lo|la|i|gli|le)\\b/gi,"").trim();
            const loc=pm[4]?(locMap2[pm[4]]||globalLoc):globalLoc;
            if(qty>0&&name.length>1){stockAdd({name,quantity:qty,unit:pm[2]||"pz",location:loc,insertedDate:todayDate()});done.push(`✓ ${name} (${qty} ${pm[2]||"pz"}) → ${loc}`);}
            ops_recap.push({type:'add',name,qty,unit:pm[2]||'pz',loc});
          }
        });
        reply=done.length?done.join("\\n"):"Non ho capito. Prova: \\"aggiungi 3 uova e 2 filetti in frigo\\""'''

NEW_C = '''        const pendingMulti:{type:string,name:string,qty:number,unit:string,loc:string}[]=[];
        parts.forEach(part=>{
          const pm=part.toLowerCase().match(/(\\d+[\\.,]?\\d*)\\s*(pz|kg|g|ml|l)?\\s+(?:di\\s+)?([\\w\\s]+?)(?:\\s+(?:al|in)\\s+(frigo|frigorifico|freezer|congelatore|dispensa|banco))?\\s*$/);
          if(pm){const qty=parseFloat(pm[1].replace(",","."));
            const name=pm[3].trim().replace(/\\b(un|una|il|lo|la|i|gli|le)\\b/gi,"").trim();
            const loc=pm[4]?(locMap2[pm[4]]||globalLoc):globalLoc;
            if(qty>0&&name.length>1) pendingMulti.push({type:'add',name,qty,unit:pm[2]||'pz',loc});
          }
        });
        if(pendingMulti.length>0){
          setPendingOps(pendingMulti);
          setMessages(p=>[...p,{role:"ai",text:`⚡ ${pendingMulti.length} prodott${pendingMulti.length===1?"o":"i"} — verifica e conferma:`}]);
          return;
        }
        reply="Non ho capito. Prova: \\"aggiungi 3 uova e 2 filetti in frigo\\x22"'''

fixes.append(("FIX C — parser aggiungi multi-item → setPendingOps", OLD_C, NEW_C))

# ─────────────────────────────────────────────────────────────────────────────
# FIX D: Parser aggiungi single-item → setPendingOps invece di stockAdd immediato
# ─────────────────────────────────────────────────────────────────────────────
OLD_D = '''          if(name.length>1){ stockAdd({name,quantity:qty,unit:m[2]||"pz",location:loc,lot,insertedDate:todayDate()}); reply=`✓ ${name} (${qty} ${m[2]||"pz"}) → ${loc}${lot?" lotto "+lot:""}.`; }
          ops_recap.push({type:'add',name,qty,unit:m[2]||'pz',loc});
        }
        if(!reply) reply="Non ho capito. Prova: \\"aggiungi 3 polli in frigo\\"";\n      }'''

NEW_D = '''          if(name.length>1){
            setPendingOps([{type:'add',name,qty,unit:m[2]||"pz",loc,lot}]);
            setMessages(p=>[...p,{role:"ai",text:`⚡ Conferma aggiunta:`}]);
            return;
          }
        }
        if(!reply) reply="Non ho capito. Prova: \\"aggiungi 3 polli in frigo\\"";
      }'''

fixes.append(("FIX D — parser aggiungi single-item → setPendingOps", OLD_D, NEW_D))

# ─────────────────────────────────────────────────────────────────────────────
# APPLICA
# ─────────────────────────────────────────────────────────────────────────────
print("=" * 60)
ok_count = 0
for label, old, new in fixes:
    count = src.count(old)
    if count == 0:
        print(f"⚠  {label}")
        print(f"   → pattern NON trovato — skip")
    elif count > 1:
        print(f"⚠  {label}")
        print(f"   → trovato {count} volte — ambiguo, skip")
    else:
        src = src.replace(old, new)
        print(f"✓  {label}")
        ok_count += 1

print("=" * 60)

if src != original:
    FILE.write_text(src, encoding="utf-8")
    print(f"\n✅ {ok_count}/{len(fixes)} fix applicati → {FILE.name}")
    print("   Esegui: npm run build 2>&1 | tail -15")
else:
    print("\nℹ  Nessuna modifica applicata.")
    print("   Tutti i pattern potrebbero essere già corretti")
    print("   o il testo del file è diverso da quello atteso.")
