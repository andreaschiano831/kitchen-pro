import shutil, datetime

SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
lines = open(SRC,encoding="utf-8").readlines()

# --- 1) Aggiungi stato editingOrdineId dopo ricezione state (riga ~4321) ---
ric_i = next(i for i,l in enumerate(lines) if "ricezione, setRicezione" in l and "useState(null)" in l)
lines.insert(ric_i+1, "  const [editingOrdineId, setEditingOrdineId] = useState(null);\n")
lines.insert(ric_i+2, "  const [editOrdineItems, setEditOrdineItems] = useState([]);\n")
lines.insert(ric_i+3, "  const [newEditItem, setNewEditItem] = useState({nome:'',qty:'',unit:'kg',prezzoUnit:''});\n")
print("Stati editing aggunti a riga", ric_i+2)

# --- 2) Nella card ordine bozza: aggiungi bottone ✏ e sezione edit ---
# Trova riga con "📤 Invia" button
invia_i = next(i for i,l in enumerate(lines) if "📤 Invia" in l and "inviaOrdine" in l)
# Inserisci bottone modifica prima di Invia
lines.insert(invia_i, "                {canEdit&&ordine.status===\"bozza\"&&(\n  <button onClick={()=>{if(editingOrdineId===ordine.id){setEditingOrdineId(null);}else{setEditingOrdineId(ordine.id);setEditOrdineItems([...(ordine.items||[])]);setNewEditItem({nome:'',qty:'',unit:'kg',prezzoUnit:''}); }}} style={{fontSize:9,padding:\"5px 12px\",borderRadius:8,border:`1px solid ${t.div}`,cursor:\"pointer\",background:editingOrdineId===ordine.id?t.gold+\"20\":\"transparent\",color:editingOrdineId===ordine.id?t.gold:t.inkMuted,fontFamily:\"var(--mono)\"}}>{editingOrdineId===ordine.id?\"✓ Chiudi\":\"✏ Modifica\"}</button>\n                )}\n")
print("Bottone modifica inserito a riga", invia_i+1)

# --- 3) Dopo il blocco totale ordine, aggiungi sezione edit items ---
# Trova riga totale (Totale: €{...})
totale_i = next(i for i,l in enumerate(lines) if "Totale: €{" in l and "reduce" in l)
# Trova </div></div> che chiude il blocco items dopo totale
close_i = next(i for i in range(totale_i, totale_i+8) if lines[i].strip()=="</div>")
close_i2 = next(i for i in range(close_i+1, close_i+5) if lines[i].strip()=="</div>")

edit_block = (
  "              {editingOrdineId===ordine.id&&(\n"
  "                <div style={{padding:\"12px 20px\",borderTop:`1px solid ${t.div}`,background:t.bgAlt,display:\"flex\",flexDirection:\"column\",gap:8}}>\n"
  "                  <div className=\"mono\" style={{fontSize:8,color:t.inkFaint,marginBottom:4}}>MODIFICA ARTICOLI</div>\n"
  "                  {editOrdineItems.map((item,i)=>(\n"
  "                    <div key={item.id||i} style={{display:\"flex\",gap:8,alignItems:\"center\"}}>\n"
  "                      <input value={item.nome} onChange={e=>{const a=[...editOrdineItems];a[i]={...a[i],nome:e.target.value};setEditOrdineItems(a);}} style={{flex:2,padding:\"5px 8px\",borderRadius:7,border:`1px solid ${t.div}`,background:t.bgCard,color:t.ink,fontFamily:\"var(--serif)\",fontStyle:\"italic\",fontSize:12,outline:\"none\"}}/>\n"
  "                      <input type=\"number\" value={item.quantitaOrdinata} onChange={e=>{const a=[...editOrdineItems];a[i]={...a[i],quantitaOrdinata:parseFloat(e.target.value)||0};setEditOrdineItems(a);}} style={{width:60,padding:\"5px 6px\",borderRadius:7,border:`1px solid ${t.div}`,background:t.bgCard,color:t.ink,fontFamily:\"var(--mono)\",fontSize:11,outline:\"none\"}}/>\n"
  "                      <input type=\"number\" value={item.prezzoUnitario||0} onChange={e=>{const a=[...editOrdineItems];a[i]={...a[i],prezzoUnitario:parseFloat(e.target.value)||0};setEditOrdineItems(a);}} placeholder=\"€\" style={{width:60,padding:\"5px 6px\",borderRadius:7,border:`1px solid ${t.div}`,background:t.bgCard,color:t.gold,fontFamily:\"var(--mono)\",fontSize:11,outline:\"none\"}}/>\n"
  "                      <button onClick={()=>setEditOrdineItems(editOrdineItems.filter((_,j)=>j!==i))} style={{padding:\"3px 8px\",borderRadius:5,border:\"none\",cursor:\"pointer\",background:t.accentGlow,color:t.danger,fontSize:12}}>✕</button>\n"
  "                    </div>\n"
  "                  ))}\n"
  "                  <div style={{display:\"flex\",gap:6,marginTop:4}}>\n"
  "                    <input value={newEditItem.nome} onChange={e=>setNewEditItem(p=>({...p,nome:e.target.value}))} placeholder=\"Nuovo articolo\" style={{flex:2,padding:\"5px 8px\",borderRadius:7,border:`1px solid ${t.div}`,background:t.bgCard,color:t.ink,fontFamily:\"var(--serif)\",fontStyle:\"italic\",fontSize:12,outline:\"none\"}}/>\n"
  "                    <input type=\"number\" value={newEditItem.qty} onChange={e=>setNewEditItem(p=>({...p,qty:e.target.value}))} placeholder=\"Qtà\" style={{width:55,padding:\"5px 6px\",borderRadius:7,border:`1px solid ${t.div}`,background:t.bgCard,color:t.ink,fontFamily:\"var(--mono)\",fontSize:11,outline:\"none\"}}/>\n"
  "                    <input value={newEditItem.unit} onChange={e=>setNewEditItem(p=>({...p,unit:e.target.value}))} placeholder=\"un\" style={{width:40,padding:\"5px 4px\",borderRadius:7,border:`1px solid ${t.div}`,background:t.bgCard,color:t.ink,fontFamily:\"var(--mono)\",fontSize:11,outline:\"none\"}}/>\n"
  "                    <button onClick={()=>{if(!newEditItem.nome||!newEditItem.qty)return;setEditOrdineItems(p=>[...p,{id:genId(),nome:newEditItem.nome,quantitaOrdinata:parseFloat(newEditItem.qty)||0,unitaMisura:newEditItem.unit,prezzoUnitario:0,quantitaRicevuta:null}]);setNewEditItem({nome:'',qty:'',unit:'kg',prezzoUnit:''}); }} style={{padding:\"5px 10px\",borderRadius:7,border:\"none\",cursor:\"pointer\",background:t.bgCard,color:t.ink,fontFamily:\"var(--mono)\",fontSize:9}}>+ Add</button>\n"
  "                  </div>\n"
  "                  <button onClick={()=>{ordineUpdate(ordine.id,{items:editOrdineItems});setEditingOrdineId(null);toast(\"Ordine aggiornato\",\"success\");}} style={{padding:\"8px\",borderRadius:8,border:\"none\",cursor:\"pointer\",background:`linear-gradient(135deg,${t.gold},${t.goldBright})`,color:\"#fff\",fontFamily:\"var(--mono)\",fontSize:10}}>💾 Salva modifiche</button>\n"
  "                </div>\n"
  "              )}\n"
)
lines.insert(close_i2+1, edit_block)
print("Sezione edit ordine inserita a riga", close_i2+2)

# --- 4) Giacenze: aggiungi +/- e ✕ su ogni item ---
# Trova riga con item.name nella sezione giacenze
giac_item_i = next(i for i,l in enumerate(lines) if "item.name" in l and "fontStyle:\"italic\"" in l and i > totale_i)
# Trova la </div> che chiude la Card giacenza
giac_close_i = next(i for i in range(giac_item_i, giac_item_i+25) if lines[i].strip()=="</Card>")

# Inserisci bottoni +/- e ✕ prima di </Card>
pm_block = (
  "                {canEdit&&(\n"
  "                  <div style={{display:\"flex\",gap:6,alignItems:\"center\",marginTop:8}}>\n"
  "                    <button onClick={()=>{const loc=item.location||\"dry\";const arr=(kitchen[loc]||[]).map((x:any)=>x.id===item.id?{...x,quantity:Math.max(0,(x.quantity||0)-1)}:x);updateLocation(loc,arr);}} style={{width:28,height:28,borderRadius:7,border:`1px solid ${t.div}`,background:t.bgAlt,color:t.ink,cursor:\"pointer\",fontFamily:\"var(--mono)\",fontSize:14}}>-</button>\n"
  "                    <span className=\"mono\" style={{minWidth:40,textAlign:\"center\",fontSize:12,color:t.ink}}>{item.quantity} {item.unit}</span>\n"
  "                    <button onClick={()=>{const loc=item.location||\"dry\";const arr=(kitchen[loc]||[]).map((x:any)=>x.id===item.id?{...x,quantity:(x.quantity||0)+1}:x);updateLocation(loc,arr);}} style={{width:28,height:28,borderRadius:7,border:`1px solid ${t.div}`,background:t.bgAlt,color:t.ink,cursor:\"pointer\",fontFamily:\"var(--mono)\",fontSize:14}}>+</button>\n"
  "                    <button onClick={()=>{const loc=item.location||\"dry\";const arr=(kitchen[loc]||[]).filter((x:any)=>x.id!==item.id);updateLocation(loc,arr);toast(item.name+\" rimosso\",\"success\");}} style={{marginLeft:\"auto\",padding:\"4px 10px\",borderRadius:7,border:\"none\",cursor:\"pointer\",background:t.accentGlow,color:t.danger,fontFamily:\"var(--mono)\",fontSize:9}}>✕ Rimuovi</button>\n"
  "                  </div>\n"
  "                )}\n"
)
lines.insert(giac_close_i, pm_block)
print("Bottoni +/- giacenza inseriti a riga", giac_close_i+1)

# --- 5) Controlla che updateLocation sia disponibile in EconomatoView ---
# Aggiungi updateLocation al destructuring useK()
usek_i = next(i for i,l in enumerate(lines) if "kitchen, ordineAdd, ordineUpdate" in l and "EconomatoView" in lines[max(0,i-5):i+1] or "kitchen, ordineAdd, ordineUpdate" in l and i > 4300 and i < 4320)
lines[usek_i] = lines[usek_i].replace(
    "kitchen, ordineAdd, ordineUpdate, confermRicezione, allItems, currentRole",
    "kitchen, ordineAdd, ordineUpdate, confermRicezione, allItems, currentRole, updateLocation"
)
print("updateLocation aggiunto a useK destructuring")

open(SRC,"w",encoding="utf-8").writelines(lines)
print("DONE")
