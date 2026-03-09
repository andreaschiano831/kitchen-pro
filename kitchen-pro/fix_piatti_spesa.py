#!/usr/bin/env python3
"""
fix_piatti_spesa.py
===================
Fix chirurgici KitchenPro.tsx — sessione PiattiManager + SpesaV2

FIX 1: Reducer — aggiunge SPESA_V2_UPDATE (necessario per edit inline)
FIX 2: useK hook — espone spesaV2Update
FIX 3: calcPorzioni — aggiunge colonna PORZIONI POSSIBILI separata da % USO
FIX 4: consumeService — chiede conferma prima di scaricare stock
FIX 5: Lista piatti card — semaforo autonomia stock a colpo d'occhio
FIX 6: SpesaItemRow — tasti +/- qty e bottone → Giacenza (carica in stock)
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
# FIX 1: Reducer SPESA_V2_UPDATE
# ─────────────────────────────────────────────────────────────────────────────
OLD_1 = '''    case "SPESA_V2_REMOVE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, spesaV2:(k.spesaV2||[]).filter(x=>x.id!==action.id)
      }))};'''

NEW_1 = '''    case "SPESA_V2_UPDATE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, spesaV2:(k.spesaV2||[]).map(x=>x.id!==action.id?x:{...x,...action.patch})
      }))};
    case "SPESA_V2_REMOVE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, spesaV2:(k.spesaV2||[]).filter(x=>x.id!==action.id)
      }))};'''

fixes.append(("FIX 1 — reducer SPESA_V2_UPDATE", OLD_1, NEW_1))

# ─────────────────────────────────────────────────────────────────────────────
# FIX 2: useK hook — espone spesaV2Update
# ─────────────────────────────────────────────────────────────────────────────
OLD_2 = "      spesaV2Toggle: (id) => { const k=kid(); if(k)dispatch({type:\"SPESA_V2_TOGGLE\",kitchenId:k,id}); },"
NEW_2 = "      spesaV2Update: (id,patch) => { const k=kid(); if(k)dispatch({type:\"SPESA_V2_UPDATE\",kitchenId:k,id,patch}); },\n      spesaV2Toggle: (id) => { const k=kid(); if(k)dispatch({type:\"SPESA_V2_TOGGLE\",kitchenId:k,id}); },"

fixes.append(("FIX 2 — hook spesaV2Update", OLD_2, NEW_2))

# ─────────────────────────────────────────────────────────────────────────────
# FIX 3: calcPorzioni — aggiunge porzioniPossibili per ingrediente
# ─────────────────────────────────────────────────────────────────────────────
OLD_3 = '''      const pctUso = inStock > 0 ? Math.min(100, Math.round((needed / inStock) * 100)) : 0;
      return { nome:ing.nome, needed:needed.toFixed(2), unit:ing.unit, inStock:inStock.toFixed(2), ok:inStock>=needed, pctUso, canMake };'''

NEW_3 = '''      const pctUso = inStock > 0 ? Math.min(100, Math.round((needed / inStock) * 100)) : 0;
      // Quante porzioni posso fare con lo stock rimasto
      const porzioniPossibili = ing.qty > 0 ? Math.floor(inStock / (ing.qty / base)) : 999;
      return { nome:ing.nome, needed:needed.toFixed(2), unit:ing.unit, inStock:inStock.toFixed(2), ok:inStock>=needed, pctUso, canMake, porzioniPossibili };'''

fixes.append(("FIX 3 — calcPorzioni aggiunge porzioniPossibili", OLD_3, NEW_3))

# ─────────────────────────────────────────────────────────────────────────────
# FIX 4: tabella forecast — aggiunge colonna PORZIONI POSSIBILI
# ─────────────────────────────────────────────────────────────────────────────
OLD_4 = '                      {["INGREDIENTE","NECESSARIO","IN STOCK","% USO","STATO"].map(h=>('
NEW_4 = '                      {["INGREDIENTE","NECESSARIO","IN STOCK","% USO","MAX PORZION.","STATO"].map(h=>('

fixes.append(("FIX 4a — header tabella forecast", OLD_4, NEW_4))

OLD_4b = '''                          <td style={{padding:"8px",minWidth:80}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <div style={{flex:1,height:4,borderRadius:2,background:t.div,overflow:"hidden"}}>
                                <div style={{width:`${barW}%`,height:"100%",background:col,borderRadius:2,transition:"width 0.3s"}}/>
                              </div>
                              <span style={{color:col,minWidth:30,textAlign:"right"}}>{d.pctUso}%</span>
                            </div>
                          </td>
                          <td style={{padding:"8px",color:d.ok?t.success:t.danger,fontSize:12}}>'''

NEW_4b = '''                          <td style={{padding:"8px",minWidth:80}}>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <div style={{flex:1,height:4,borderRadius:2,background:t.div,overflow:"hidden"}}>
                                <div style={{width:`${barW}%`,height:"100%",background:col,borderRadius:2,transition:"width 0.3s"}}/>
                              </div>
                              <span style={{color:col,minWidth:30,textAlign:"right"}}>{d.pctUso}%</span>
                            </div>
                          </td>
                          <td style={{padding:"8px",textAlign:"center"}}>
                            <span className="mono" style={{
                              fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:5,
                              background:d.porzioniPossibili>=forecastCoperti?t.success+"18":d.porzioniPossibili>0?t.warning+"18":t.danger+"18",
                              color:d.porzioniPossibili>=forecastCoperti?t.success:d.porzioniPossibili>0?t.warning:t.danger,
                            }}>{d.porzioniPossibili>=999?"∞":d.porzioniPossibili}</span>
                          </td>
                          <td style={{padding:"8px",color:d.ok?t.success:t.danger,fontSize:12}}>'''

fixes.append(("FIX 4b — cella porzioniPossibili in tabella forecast", OLD_4b, NEW_4b))

# ─────────────────────────────────────────────────────────────────────────────
# FIX 5: consumeService — conferma prima di scaricare
# ─────────────────────────────────────────────────────────────────────────────
OLD_5 = '''  function consumeService(piatto, coperti) {
    if(!piatto.ingredienti?.length) { logService(piatto,coperti); return; }'''

NEW_5 = '''  function consumeService(piatto, coperti) {
    if(!piatto.ingredienti?.length) { logService(piatto,coperti); return; }
    if(!confirm(`Scaricare ingredienti per ${coperti} coperti di "${piatto.nome}"?\\nL'operazione aggiornerà le giacenze.`)) return;'''

fixes.append(("FIX 5 — consumeService chiede conferma", OLD_5, NEW_5))

# ─────────────────────────────────────────────────────────────────────────────
# FIX 6: Card lista piatti — semaforo autonomia stock
# ─────────────────────────────────────────────────────────────────────────────
OLD_6 = '''  const catLabels = {tutti:"Tutti",...Object.fromEntries(PIATTO_CATEGORIE.map(c=>[c.key,c.icon+" "+c.label]))};
  const catActive = piatti.filter(p=>p.attivo);'''

NEW_6 = '''  const catLabels = {tutti:"Tutti",...Object.fromEntries(PIATTO_CATEGORIE.map(c=>[c.key,c.icon+" "+c.label]))};
  const catActive = piatti.filter(p=>p.attivo);

  // ── Semaforo autonomia per card lista ────────────────────
  function getStockSignal(piatto) {
    const calc = calcPorzioni(piatto, copertiServizio);
    if(!calc) return null;
    const stats = calcStats(piatto);
    const minDays = stats?.minDays;
    if(calc.porzioni >= copertiServizio) {
      return { col:"#3D7A4A", label: calc.porzioni >= copertiServizio*2 ? "✓✓" : "✓", title:`Stock OK — ${calc.porzioni} coperti possibili` };
    } else if(calc.porzioni > 0) {
      return { col:"#B8860B", label:`⚠ ${calc.porzioni}`, title:`Stock parziale — solo ${calc.porzioni} coperti` };
    } else {
      return { col:"#C04A4A", label:"✗", title:"Stock insufficiente" };
    }
  }'''

fixes.append(("FIX 6a — getStockSignal helper", OLD_6, NEW_6))

# Aggiunge il semaforo nella card del piatto nella lista
OLD_6b = '''            <div key={p.id} onClick={()=>{setSelPiatto(p.id);setView("detail");}} style={{
                display:"flex",alignItems:"center",gap:12,padding:"12px 16px",
                borderRadius:12,border:`1px solid ${t.div}`,cursor:"pointer",
                background:t.bgCard,transition:"all 0.2s",'''

NEW_6b = '''            <div key={p.id} onClick={()=>{setSelPiatto(p.id);setView("detail");}} style={{
                display:"flex",alignItems:"center",gap:12,padding:"12px 16px",
                borderRadius:12,border:`1px solid ${(()=>{const s=getStockSignal(p);return s?s.col+"44":t.div})()}`,cursor:"pointer",
                background:t.bgCard,transition:"all 0.2s",'''

fixes.append(("FIX 6b — bordo card colorato da semaforo", OLD_6b, NEW_6b))

# ─────────────────────────────────────────────────────────────────────────────
# FIX 7: SpesaItemRow — edit inline qty + bottone → Giacenza
# Sostituisce l'intera funzione
# ─────────────────────────────────────────────────────────────────────────────
OLD_7 = '''function SpesaItemRow({ item, t, canEdit, onToggle, onRemove }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",
      opacity:item.checked?0.4:1,transition:"opacity 0.2s"}}>
      <input type="checkbox" checked={!!item.checked} onChange={()=>onToggle(item.id)}
        style={{cursor:"pointer",accentColor:t.gold,minWidth:16,minHeight:16}}/>
      <div style={{flex:1}}>
        <span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink,
          textDecoration:item.checked?"line-through":"none"}}>{item.nome}</span>
        <span className="mono" style={{fontSize:9,color:t.inkFaint,marginLeft:6}}>
          {item.quantita} {item.unitaMisura}
        </span>
        {item.note&&<span style={{fontSize:9,color:t.inkFaint,marginLeft:4}}>· {item.note}</span>}
      </div>
      {canEdit&&(
        <button onClick={()=>onRemove(item.id)} style={{
          background:"none",border:"none",color:t.danger,cursor:"pointer",
          fontSize:12,minWidth:24,minHeight:24,display:"flex",alignItems:"center",justifyContent:"center",
        }}>✕</button>
      )}
    </div>
  );
}'''

NEW_7 = '''function SpesaItemRow({ item, t, canEdit, onToggle, onRemove, onUpdate, onCaricaGiacenza }) {
  const [editQty, setEditQty] = React.useState(false);
  const [qtyVal, setQtyVal]   = React.useState(String(item.quantita||"1"));

  function commitQty() {
    const v = parseFloat(qtyVal);
    if(isFinite(v) && v > 0 && onUpdate) onUpdate(item.id, {quantita: String(v)});
    setEditQty(false);
  }

  return (
    <div style={{display:"flex",alignItems:"center",gap:5,padding:"5px 0",
      opacity:item.checked?0.4:1,transition:"opacity 0.2s"}}>
      <input type="checkbox" checked={!!item.checked} onChange={()=>onToggle(item.id)}
        style={{cursor:"pointer",accentColor:t.gold,minWidth:16,minHeight:16}}/>
      <div style={{flex:1,minWidth:0}}>
        <span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink,
          textDecoration:item.checked?"line-through":"none"}}>{item.nome}</span>
        {/* Qty inline edit */}
        {editQty ? (
          <span style={{display:"inline-flex",alignItems:"center",gap:3,marginLeft:6}}>
            <input autoFocus type="number" value={qtyVal}
              onChange={e=>setQtyVal(e.target.value)}
              onBlur={commitQty}
              onKeyDown={e=>{if(e.key==="Enter")commitQty();if(e.key==="Escape")setEditQty(false);}}
              style={{width:50,padding:"1px 4px",borderRadius:5,border:`1px solid ${t.gold}`,
                background:t.bgAlt,color:t.ink,fontFamily:"var(--mono)",fontSize:11,outline:"none"}}/>
            <span className="mono" style={{fontSize:9,color:t.inkFaint}}>{item.unitaMisura}</span>
          </span>
        ) : (
          <span className="mono" onClick={()=>{if(canEdit)setEditQty(true);}}
            style={{fontSize:9,color:t.inkFaint,marginLeft:6,cursor:canEdit?"pointer":"default",
              borderBottom:canEdit?`1px dashed ${t.div}`:"none"}}>
            {item.quantita} {item.unitaMisura}
          </span>
        )}
        {item.note&&<span style={{fontSize:9,color:t.inkFaint,marginLeft:4}}>· {item.note}</span>}
      </div>
      {canEdit&&!item.checked&&(
        <>
          {/* +/- rapidi */}
          <button onClick={()=>{
            const v=parseFloat(item.quantita||"1");
            if(onUpdate) onUpdate(item.id,{quantita:String(Math.max(0.1,+(v-1).toFixed(2)))});
          }} style={{background:t.bgAlt,border:`1px solid ${t.div}`,color:t.inkMuted,
            cursor:"pointer",borderRadius:5,width:20,height:20,fontSize:12,lineHeight:"1",
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>−</button>
          <button onClick={()=>{
            const v=parseFloat(item.quantita||"1");
            if(onUpdate) onUpdate(item.id,{quantita:String(+(v+1).toFixed(2))});
          }} style={{background:t.bgAlt,border:`1px solid ${t.div}`,color:t.inkMuted,
            cursor:"pointer",borderRadius:5,width:20,height:20,fontSize:12,lineHeight:"1",
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
          {/* Carica in giacenza */}
          {onCaricaGiacenza&&(
            <button onClick={()=>onCaricaGiacenza(item)}
              title="Carica in giacenza (economato)"
              style={{padding:"2px 7px",borderRadius:6,border:`1px solid ${t.success}44`,cursor:"pointer",
                background:t.success+"15",color:t.success,fontFamily:"var(--mono)",fontSize:8,
                whiteSpace:"nowrap",flexShrink:0}}>
              → stock
            </button>
          )}
        </>
      )}
      {canEdit&&(
        <button onClick={()=>onRemove(item.id)} style={{
          background:"none",border:"none",color:t.danger,cursor:"pointer",
          fontSize:12,minWidth:20,minHeight:20,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
        }}>✕</button>
      )}
    </div>
  );
}'''

fixes.append(("FIX 7 — SpesaItemRow editabile + tasto → stock", OLD_7, NEW_7))

# ─────────────────────────────────────────────────────────────────────────────
# FIX 8: SpesaV2View — passa onUpdate e onCaricaGiacenza a SpesaItemRow
# ─────────────────────────────────────────────────────────────────────────────
OLD_8 = '''  const { kitchen, allItems, piattoAdd, piattoUpdate, piattoRemove, piattoToggleActive, setExternalAppUrl, stockAdd, removeItem, adjustItem, spesaV2Add } = useK();'''
NEW_8 = '''  const { kitchen, allItems, piattoAdd, piattoUpdate, piattoRemove, piattoToggleActive, setExternalAppUrl, stockAdd, removeItem, adjustItem, spesaV2Add } = useK();'''
# (PiattiManager non cambia qui)

# Aggiorna SpesaV2View per usare spesaV2Update e onCaricaGiacenza
OLD_8b = '''  const items = kitchen?.spesaV2||[];
  const [tab, setTab]     = useState("tabella");
  const [form, setForm]   = useState({nome:"",qty:"1",unit:"pz",tipologia:"alimenti",frequenza:"giornaliero",note:""});'''

NEW_8b = '''  const items = kitchen?.spesaV2||[];
  const [tab, setTab]     = useState("tabella");
  const [form, setForm]   = useState({nome:"",qty:"1",unit:"pz",tipologia:"alimenti",frequenza:"giornaliero",note:""});

  // ── Carica articolo spesa in giacenza ─────────────────────
  function caricaInGiacenza(item) {
    const qty = parseFloat(item.quantita)||1;
    const loc = "dry"; // default dispensa — modificabile
    stockAdd({name:item.nome, quantity:qty, unit:item.unitaMisura||"pz", location:loc, insertedDate:todayDate()});
    spesaV2Toggle(item.id); // spunta l'articolo
    toast(`✓ ${item.nome} (${qty} ${item.unitaMisura||"pz"}) → Dispensa`, "success");
  }'''

fixes.append(("FIX 8 — SpesaV2View caricaInGiacenza", OLD_8b, NEW_8b))

# ─────────────────────────────────────────────────────────────────────────────
# FIX 9: SpesaItemRow usages — passa onUpdate e onCaricaGiacenza
# ─────────────────────────────────────────────────────────────────────────────
OLD_9a = '''                  <SpesaItemRow key={item.id} item={item} t={t} canEdit={canEdit}
                    onToggle={spesaV2Toggle} onRemove={spesaV2Remove}/>
                ))}
                {riga.giornalieri.length===0'''

NEW_9a = '''                  <SpesaItemRow key={item.id} item={item} t={t} canEdit={canEdit}
                    onToggle={spesaV2Toggle} onRemove={spesaV2Remove}
                    onUpdate={spesaV2Update} onCaricaGiacenza={caricaInGiacenza}/>
                ))}
                {riga.giornalieri.length===0'''

fixes.append(("FIX 9a — SpesaItemRow giornalieri + props", OLD_9a, NEW_9a))

OLD_9b = '''                  <SpesaItemRow key={item.id} item={item} t={t} canEdit={canEdit}
                    onToggle={spesaV2Toggle} onRemove={spesaV2Remove}/>
                ))}
                {riga.settimanali.length===0'''

NEW_9b = '''                  <SpesaItemRow key={item.id} item={item} t={t} canEdit={canEdit}
                    onToggle={spesaV2Toggle} onRemove={spesaV2Remove}
                    onUpdate={spesaV2Update} onCaricaGiacenza={caricaInGiacenza}/>
                ))}
                {riga.settimanali.length===0'''

fixes.append(("FIX 9b — SpesaItemRow settimanali + props", OLD_9b, NEW_9b))

# ─────────────────────────────────────────────────────────────────────────────
# FIX 10: SpesaV2View — destruttura spesaV2Update dall'hook
# ─────────────────────────────────────────────────────────────────────────────
OLD_10 = "  const { kitchen, allItems, stockAdd, spesaV2Add, spesaV2Toggle, spesaV2Remove, spesaV2Clear, currentRole } = useK();"
NEW_10 = "  const { kitchen, allItems, stockAdd, spesaV2Add, spesaV2Update, spesaV2Toggle, spesaV2Remove, spesaV2Clear, currentRole } = useK();"

fixes.append(("FIX 10 — SpesaV2View destruttura spesaV2Update", OLD_10, NEW_10))

# ─────────────────────────────────────────────────────────────────────────────
# APPLICA TUTTI I FIX
# ─────────────────────────────────────────────────────────────────────────────
print("=" * 65)
ok_count = 0
skip_count = 0
for label, old, new in fixes:
    count = src.count(old)
    if count == 0:
        print(f"⚠  {label}")
        print(f"   → pattern NON trovato — skip")
        skip_count += 1
    elif count > 1:
        print(f"⚠  {label}")
        print(f"   → trovato {count} volte — ambiguo, skip")
        skip_count += 1
    else:
        src = src.replace(old, new)
        print(f"✓  {label}")
        ok_count += 1
print("=" * 65)

if src != original:
    FILE.write_text(src, encoding="utf-8")
    print(f"\n✅ {ok_count}/{len(fixes)} fix applicati → {FILE.name}")
    if skip_count:
        print(f"⚠  {skip_count} fix saltati — controlla i messaggi sopra")
    print("   Esegui: npm run build 2>&1 | tail -20")
else:
    print("\nℹ  Nessuna modifica applicata.")
