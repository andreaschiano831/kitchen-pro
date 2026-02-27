from pathlib import Path
import re

f = Path("/workspaces/kitchen-pro/kitchen-pro/src/pages/KitchenProFull.tsx")
src = f.read_text()
orig_len = src.count("\n")
fixes = 0

def fix(old, new, label, count=1):
    global src, fixes
    if old in src:
        src = src.replace(old, new, count)
        fixes += 1
        print(f"  ✅ {label}")
    else:
        print(f"  ⚠  {label} — pattern non trovato")

print("=== FIX TYPESCRIPT ERRORS ===\n")

# ── 1. SpeechRecognition: cast window as any ─────────────────
fix(
    "const SR = window.SpeechRecognition||window.webkitSpeechRecognition;",
    "const SR = (window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;",
    "SpeechRecognition window cast"
)

# ── 2. Date arithmetic: .getTime() ───────────────────────────
fix(
    "(new Date(scadeIl)-Date.now())/3_600_000",
    "(new Date(scadeIl).getTime()-Date.now())/3_600_000",
    "computeStatoScadenza Date arithmetic"
)
src = re.sub(
    r"new Date\(g\.expiresAt\)-Date\.now\(\)",
    "new Date(g.expiresAt).getTime()-Date.now()",
    src
); fixes+=1; print("  ✅ selectAlertCritici Date arithmetic")

fix(
    "(new Date(iso)-new Date())/3600000",
    "(new Date(iso).getTime()-new Date().getTime())/3600000",
    "hoursUntil Date arithmetic"
)
src = re.sub(
    r"Date\.now\(\)-new Date\(tv\.arrivatoIl\)",
    "Date.now()-new Date(tv.arrivatoIl).getTime()",
    src
); fixes+=1; print("  ✅ tavolo arrivatoIl arithmetic")
src = re.sub(
    r"Date\.now\(\)-new Date\(tk\.createdAt\)",
    "Date.now()-new Date(tk.createdAt).getTime()",
    src
); fixes+=1; print("  ✅ ticket createdAt arithmetic")
src = re.sub(
    r"new Date\(a\.expiresAt\)-new Date\(b\.expiresAt\)",
    "new Date(a.expiresAt).getTime()-new Date(b.expiresAt).getTime()",
    src
); fixes+=1; print("  ✅ fifoAlert sort arithmetic")

# ── 3. Btn: make disabled and style optional ──────────────────
fix(
    "function Btn({ onClick, disabled, children, variant=\"primary\", t, style:sx={} }) {",
    "function Btn({ onClick, disabled=false, children, variant=\"primary\", t, style:sx={} }: {onClick:any,disabled?:any,children:any,variant?:string,t:any,style?:any}) {",
    "Btn optional disabled"
)

# ── 4. CardHeader: make right optional ───────────────────────
fix(
    "function CardHeader({ title, right, t }) {",
    "function CardHeader({ title, right=null, t }: {title:any,right?:any,t:any}) {",
    "CardHeader optional right"
)

# ── 5. BarMini: make color optional ──────────────────────────
fix(
    "function BarMini({ value, max, t, color }) {",
    "function BarMini({ value, max, t, color=undefined }: {value:any,max:any,t:any,color?:any}) {",
    "BarMini optional color"
)

# ── 6. LuxInput: add onKeyDown to props ──────────────────────
fix(
    "function LuxInput({ value, onChange, placeholder, type=\"text\", t, style:sx={} }) {",
    "function LuxInput({ value, onChange, placeholder=\"\", type=\"text\", t, style:sx={}, onKeyDown=undefined }: {value:any,onChange:any,placeholder?:any,type?:string,t:any,style?:any,onKeyDown?:any}) {",
    "LuxInput optional placeholder + onKeyDown"
)
# Passa onKeyDown al DOM input
fix(
    "onFocus={e=>e.target.style.borderColor=t.gold}\n      onBlur={e=>e.target.style.borderColor=t.div}\n    />",
    "onKeyDown={onKeyDown}\n      onFocus={e=>e.target.style.borderColor=t.gold}\n      onBlur={e=>e.target.style.borderColor=t.div}\n    />",
    "LuxInput forward onKeyDown"
)

# ── 7. SetupScreen: sx→style ─────────────────────────────────
fix(
    'disabled={!name.trim()} variant="primary" sx={{marginTop:8}}>',
    'disabled={!name.trim()} variant="primary" style={{marginTop:8}}>',
    "SetupScreen Btn sx→style"
)

# ── 8. Duplicate border keys in object literals ───────────────
# Pattern: due volte border: in object literal con condizione ternaria
# Fix: unifica le due proprietà border in una sola
def fix_dup_border(pattern_before, label):
    global src, fixes
    # trova tutti gli oggetti stile con border duplicato
    count = src.count(pattern_before)
    if count > 0:
        src = src.replace(pattern_before,
            pattern_before.split("\n")[0],  # fallback se non trovato
            1)
    print(f"  ⚠  {label} — gestito separatamente")

# Fix specifici per i border duplicati — rimuoviamo il secondo border
# Inventario tabs (loc === l.key)
src = re.sub(
    r"(background:loc===l\.key[^\n]+\n\s+color:loc===l\.key[^\n]+\n\s+boxShadow:[^\n]+\n\s+border:loc===l\.key[^\n]+\n\s+transform:[^\n]+\n\s+transition:[^\n]+\n\s+\}\})\s*\n\s*border:loc===l\.key[^\n]+,",
    r"\1,",
    src
)

# Rimuove border duplicati in tutti i button style objects
# Pattern generale: due righe `border:` consecutive in un oggetto
src = re.sub(
    r"(border:[^\n,}]+,\n\s+)(border:[^\n,}]+,)",
    r"\1",
    src
)
fixes+=1; print("  ✅ Duplicate border keys removed")

# ── 9. c.icon nel filtro categorie ───────────────────────────
fix(
    "}}>{c.icon||\"\"} {c.label}</button>",
    "}}>{(c as any).icon||\"\"} {c.label}</button>",
    "c.icon type cast"
)

# ── 10. FileReader result split ───────────────────────────────
fix(
    "const b64 = ev.target.result.split(\",\")[1];",
    "const b64 = (ev.target.result as string).split(\",\")[1];",
    "FileReader result cast to string"
)

# ── 11. InventoryView Btn senza disabled ─────────────────────
fix(
    "{canEdit&&<Btn t={t} variant={showForm?\"ghost\":\"primary\"} onClick={()=>setShowForm(!showForm)}>",
    "{canEdit&&<Btn t={t} variant={showForm?\"ghost\":\"primary\"} onClick={()=>setShowForm(!showForm)} disabled={false}>",
    "InventoryView Btn disabled"
)

# ── 12. MEP Btn senza disabled ───────────────────────────────
fix(
    "<Btn t={t} variant=\"ghost\" onClick={()=>{setAiPreview(null);setAiPreviewSel({});}}>← Rianalizza</Btn>",
    "<Btn t={t} variant=\"ghost\" onClick={()=>{setAiPreview(null);setAiPreviewSel({});}} disabled={false}>← Rianalizza</Btn>",
    "MEP Rianalizza Btn"
)
fix(
    "<Btn t={t} variant=\"ghost\" onClick={()=>setShowAIImport(false)}>← Torna alla lista</Btn>",
    "<Btn t={t} variant=\"ghost\" onClick={()=>setShowAIImport(false)} disabled={false}>← Torna alla lista</Btn>",
    "MEP Torna lista Btn"
)

# Modal load-in
fix(
    "<Btn t={t} variant=\"gold\" onClick={doLoadIn}>↑ Carica in giacenza</Btn>",
    "<Btn t={t} variant=\"gold\" onClick={doLoadIn} disabled={false}>↑ Carica in giacenza</Btn>",
    "Modal loadIn Btn"
)
fix(
    "<Btn t={t} variant=\"ghost\" onClick={()=>setMoveModal(null)}>Annulla</Btn>",
    "<Btn t={t} variant=\"ghost\" onClick={()=>setMoveModal(null)} disabled={false}>Annulla</Btn>",
    "Modal Annulla Btn"
)

# Economato Btn
fix(
    "<Btn t={t} onClick={()=>inviaOrdine(ordine.id)} style={{fontSize:9,padding:\"5px 12px\"}}>📤 Invia</Btn>",
    "<Btn t={t} onClick={()=>inviaOrdine(ordine.id)} disabled={false} style={{fontSize:9,padding:\"5px 12px\"}}>📤 Invia</Btn>",
    "Economato Invia Btn"
)
fix(
    "<Btn t={t} variant=\"gold\" onClick={()=>confermOrdine(ordine)} style={{fontSize:9,padding:\"5px 12px\"}}>",
    "<Btn t={t} variant=\"gold\" onClick={()=>confermOrdine(ordine)} disabled={false} style={{fontSize:9,padding:\"5px 12px\"}}>",
    "Economato Conferma Btn"
)

# ServizioView Btn
fix(
    "<Btn t={t} variant=\"gold\" onClick={addTavolo}>Aggiungi</Btn>",
    "<Btn t={t} variant=\"gold\" onClick={addTavolo} disabled={false}>Aggiungi</Btn>",
    "ServizioView addTavolo Btn"
)

# ── 13. LuxInput placeholder in PAR settings ─────────────────
fix(
    """                  <LuxInput
                    value={currentPar[key]??PAR_PRESET[key]??0}
                    onChange={e=>setParCategory(key,e.target.value)}
                    type="number" t={t}
                    style={{padding:"7px 10px",fontSize:12}}
                  />""",
    """                  <LuxInput
                    value={currentPar[key]??PAR_PRESET[key]??0}
                    onChange={e=>setParCategory(key,e.target.value)}
                    placeholder=""
                    type="number" t={t}
                    style={{padding:"7px 10px",fontSize:12}}
                  />""",
    "PAR LuxInput placeholder"
)

# fExpiry date input
fix(
    '<LuxInput value={fExpiry} onChange={e=>setFExpiry(e.target.value)} type="date" t={t}/>',
    '<LuxInput value={fExpiry} onChange={e=>setFExpiry(e.target.value)} placeholder="" type="date" t={t}/>',
    "fExpiry LuxInput placeholder"
)

# ── SALVA ────────────────────────────────────────────────────
f.write_text(src)
print(f"\n{'='*40}")
print(f"Tot fix applicati: {fixes}")
print(f"Righe: {orig_len} → {src.count(chr(10))}")
print(f"\nOra esegui:")
print(f"  cd /workspaces/kitchen-pro/kitchen-pro && npm run build")
