python3 fix_pending_ops.py#!/usr/bin/env python3
"""
fix_pending_ops.py
==================
Fix chirurgico per AIPanel in KitchenPro.tsx:

PROBLEMA: i parser locali (aggiungi/carica, +/- pattern, scala, prepara)
chiamano stockAdd() direttamente senza passare per pendingOps.
La tabella di conferma esiste ma non viene mai mostrata.

COSA FA QUESTO SCRIPT:
1. Sostituisce il blocco +/- pattern per usare setPendingOps invece di stockAdd
2. Sostituisce il blocco aggiungi multi-item per usare setPendingOps
3. Sostituisce il blocco aggiungi single-item per usare setPendingOps
4. Fix bug nel bottone Conferma (usava 'ops' invece di 'pendingOps')

BACKUP: crea automaticamente .bak prima di modificare
"""

import re, shutil, sys
from pathlib import Path

FILE = Path("/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx")

if not FILE.exists():
    print(f"ERRORE: file non trovato: {FILE}")
    sys.exit(1)

# Backup
bak = FILE.with_suffix(".tsx.bak_fix_pending")
shutil.copy2(FILE, bak)
print(f"✓ Backup creato: {bak.name}")

src = FILE.read_text(encoding="utf-8")
original = src

# ─────────────────────────────────────────────────────────────────────────────
# FIX 1: Blocco +/- pattern — invece di eseguire subito, costruisce pendingOps
# ─────────────────────────────────────────────────────────────────────────────

OLD_PLUS_MINUS = """      if(ops.length>0){
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
        }"""

NEW_PLUS_MINUS = """      if(ops.length>0){
          const pendingList = ops.map(({sign,qty,unit,name,loc})=>({
            type: sign==="+" ? "add" : "remove",
            name, qty, unit, loc,
          }));
          setPendingOps(pendingList);
          setMessages(p=>[...p,{role:"ai",text:`⚡ ${pendingList.length} operazion${pendingList.length===1?"e":"i"} da confermare:`}]);
          return;
        }"""

# ─────────────────────────────────────────────────────────────────────────────
# FIX 2: Blocco aggiungi multi-item — setPendingOps invece di stockAdd
# ─────────────────────────────────────────────────────────────────────────────

OLD_MULTI = """        const done:string[]=[];
        parts.forEach(part=>{
          const pm=part.toLowerCase().match(/(\\d+[\\.,]?\\d*)\\s*(pz|kg|g|ml|l)?\\s+(?:di\\s+)?([\\w\\s]+?)(?:\\s+(?:al|in)\\s+(frigo|frigorifico|freezer|congelatore|dispensa|banco))?\\s*$/);
          if(pm){const qty=parseFloat(pm[1].replace(",","."));
            const name=pm[3].trim().replace(/\\b(un|una|il|lo|la|i|gli|le)\\b/gi,"").trim();
            const loc=pm[4]?(locMap2[pm[4]]||globalLoc):globalLoc;
            if(qty>0&&name.length>1){stockAdd({name,quantity:qty,unit:pm[2]||"pz",location:loc,insertedDate:todayDate()});done.push(`✓ ${name} (${qty} ${pm[2]||"pz"}) → ${loc}`);}
            ops_recap.push({type:'add',name,qty,unit:pm[2]||'pz',loc});
          }
        });
        reply=done.length?done.join("\\n"):"Non ho capito. Prova: \\"aggiungi 3 uova e 2 filetti in frigo\\"""""

NEW_MULTI = """        const pendingMulti:{type:string,name:string,qty:number,unit:string,loc:string}[]=[];
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
          setMessages(p=>[...p,{role:"ai",text:`⚡ ${pendingMulti.length} prodott${pendingMulti.length===1?"o":"i"} da confermare:`}]);
          return;
        }
        reply="Non ho capito. Prova: \\"aggiungi 3 uova e 2 filetti in frigo\\""""

# ─────────────────────────────────────────────────────────────────────────────
# FIX 3: Blocco aggiungi single-item — setPendingOps invece di stockAdd
# ─────────────────────────────────────────────────────────────────────────────

OLD_SINGLE = """          if(m) {
          const qty=m[1]?parseFloat(m[1].replace(",",".")):1;
          const name=m[3].replace(/\\s+(al|in|nel|nella)\\s+(frigo|frigorifico|freezer|congelatore|dispensa|secco|banco)\\s*$/i,"").trim();
          const locKey=m[4]||(lower.match(/\\b(frigo|frigorifico|freezer|congelatore|dispensa|secco|banco)\\b/)||[])[0]||"frigo";
          const loc=locMap[locKey]||"fridge";
          const lot=m[5]||undefined;
          if(name.length>1){ stockAdd({name,quantity:qty,unit:m[2]||"pz",location:loc,lot,insertedDate:todayDate()}); reply=`✓ ${name} (${qty} ${m[2]||"pz"}) → ${loc}${lot?" lotto "+lot:""}.`; }
          ops_recap.push({type:'add',name,qty,unit:m[2]||'pz',loc});
        }
        if(!reply) reply="Non ho capito. Prova: \\"aggiungi 3 polli in frigo\\"";\n      }"""

NEW_SINGLE = """          if(m) {
          const qty=m[1]?parseFloat(m[1].replace(",",".")):1;
          const name=m[3].replace(/\\s+(al|in|nel|nella)\\s+(frigo|frigorifico|freezer|congelatore|dispensa|secco|banco)\\s*$/i,"").trim();
          const locKey=m[4]||(lower.match(/\\b(frigo|frigorifico|freezer|congelatore|dispensa|secco|banco)\\b/)||[])[0]||"frigo";
          const loc=locMap[locKey]||"fridge";
          const lot=m[5]||undefined;
          if(name.length>1){
            setPendingOps([{type:'add',name,qty,unit:m[2]||"pz",loc,lot}]);
            setMessages(p=>[...p,{role:"ai",text:`⚡ Conferma aggiunta:`}]);
            return;
          }
        }
        if(!reply) reply="Non ho capito. Prova: \\"aggiungi 3 polli in frigo\\"";\n      }"""

# ─────────────────────────────────────────────────────────────────────────────
# FIX 4: Bottone Conferma — usa pendingOps (fix bug variabile 'ops' inesistente)
#         + aggiunge messaggio riepilogo con dettagli dopo conferma
# ─────────────────────────────────────────────────────────────────────────────

OLD_CONFIRM_BTN = """            <button onClick={()=>{
              pendingOps.forEach(op=>{
                if(op.type==="add") stockAdd({name:op.name,quantity:op.qty,unit:op.unit,location:op.loc,insertedDate:todayDate()});
                else { const f=allItems().find(x=>x.name.toLowerCase().includes(op.name.toLowerCase())); if(f) adjustItem(f.id,-op.qty); }
              });
              const recap=ops.map((op:any)=>op.type==="add"?"+ "+op.name+" ("+op.qty+" "+op.unit+") "+op.loc:"- scalato "+op.name).join("\\n");
              setMessages(p=>[...p,{role:"ai",text:recap}]);
              setPendingOps(null);
            }} style={{flex:1,padding:"7px",borderRadius:8,border:"none",cursor:"pointer",background:t.gold,color:"#fff",fontFamily:"var(--mono)",fontSize:10,fontWeight:600}}>✓ Conferma</button>"""

NEW_CONFIRM_BTN = """            <button onClick={()=>{
              const recap:string[]=[];
              pendingOps.forEach(op=>{
                if(op.type==="add"){
                  stockAdd({name:op.name,quantity:op.qty,unit:op.unit,location:op.loc,lot:op.lot,insertedDate:todayDate()});
                  const locLabel:{[k:string]:string}={fridge:"Frigo",freezer:"Freezer",dry:"Dispensa",counter:"Banco"};
                  recap.push(`✓ ${op.name} · ${op.qty} ${op.unit} → ${locLabel[op.loc]||op.loc}`);
                } else {
                  const f=allItems().find(x=>x.name.toLowerCase().includes(op.name.toLowerCase()));
                  if(f){ adjustItem(f.id,-op.qty); recap.push(`✓ Scalati ${op.qty}${op.unit} da ${f.name}`); }
                  else recap.push(`✗ Non trovato: ${op.name}`);
                }
              });
              setMessages(p=>[...p,{role:"ai",text:recap.join("\\n")}]);
              setPendingOps(null);
            }} style={{flex:1,padding:"7px",borderRadius:8,border:"none",cursor:"pointer",background:t.gold,color:"#fff",fontFamily:"var(--mono)",fontSize:10,fontWeight:600}}>✅ Applica</button>"""

# ─────────────────────────────────────────────────────────────────────────────
# APPLICA LE SOSTITUZIONI
# ─────────────────────────────────────────────────────────────────────────────

fixes = [
    ("FIX 1 — +/- pattern → setPendingOps",       OLD_PLUS_MINUS,    NEW_PLUS_MINUS),
    ("FIX 2 — aggiungi multi-item → setPendingOps", OLD_MULTI,        NEW_MULTI),
    ("FIX 3 — aggiungi single-item → setPendingOps", OLD_SINGLE,      NEW_SINGLE),
    ("FIX 4 — bottone Conferma bug fix + recap",   OLD_CONFIRM_BTN,   NEW_CONFIRM_BTN),
]

ok = True
for label, old, new in fixes:
    count = src.count(old)
    if count == 0:
        print(f"⚠  {label}: pattern NON trovato — skip (potrebbe essere già applicato o testo diverso)")
        ok = False
    elif count > 1:
        print(f"⚠  {label}: pattern trovato {count} volte — skip (ambiguo)")
        ok = False
    else:
        src = src.replace(old, new)
        print(f"✓  {label}")

if not ok:
    print("\n⚠  Alcuni fix non applicati. Controlla i messaggi sopra.")
    print("   Il file NON è stato modificato per i fix mancanti.")
    print("   Il backup è comunque disponibile.")

if src != original:
    FILE.write_text(src, encoding="utf-8")
    applied = sum(1 for _, old, _ in fixes if old not in src or src.count(old) == 0)
    print(f"\n✅ File aggiornato. Esegui: npm run build")
else:
    print("\nℹ  Nessuna modifica applicata.")
