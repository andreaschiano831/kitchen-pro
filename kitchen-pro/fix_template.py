SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
txt = open(SRC, encoding="utf-8").read()

# 1) Aggiungi rinnovaLotti + CATEGORIA_COLORS dopo saveList
old_state = "  const saveList=(l:any[])=>{setSlList(l);localStorage.setItem(SLKEY,JSON.stringify(l));};"
new_state = """  const saveList=(l:any[])=>{setSlList(l);localStorage.setItem(SLKEY,JSON.stringify(l));};

  function rinnovaLotti(sl:any) {
    const allFatture:any[]=(() => {try{return JSON.parse(localStorage.getItem("fatture-storico")||"[]");}catch{return[];}})();
    const sorted=[...allFatture].sort((a:any,b:any)=>new Date(b.at).getTime()-new Date(a.at).getTime());
    let aggiornati=0;
    const nuoviIng=sl.ingredienti.map((ing:any)=>{
      for(const f of sorted){
        const match=f.prodotti.find((p:any)=>p.lotto&&(
          p.nome.toLowerCase().includes(ing.nome.toLowerCase().split(" ")[0])||
          ing.nome.toLowerCase().includes(p.nome.toLowerCase().split(" ")[0])
        ));
        if(match){aggiornati++;return {...ing,lotto:match.lotto};}
      }
      const sm=items.find((x:any)=>x.lot&&x.name.toLowerCase().includes(ing.nome.toLowerCase().split(" ")[0]));
      if(sm){aggiornati++;return {...ing,lotto:sm.lot};}
      return ing;
    });
    const scad=new Date();scad.setDate(scad.getDate()+3);
    const updated={...sl,ingredienti:nuoviIng,dataProd:todayDate(),scadenza:scad.toISOString().slice(0,10),lotto:"KP-"+Date.now().toString(36).toUpperCase()};
    saveList(slList.map((x:any)=>x.id===sl.id?updated:x));
    toast(aggiornati>0?"Rinnovo lotti: "+aggiornati+" aggiornati":"Nessun lotto trovato nelle fatture","success");
  }

  const CATCOL:any={frigo:"#1a5276",freezer:"#1a3a6b",banco:"#1e6b3a",dry:"#7d5a1e",default:"#1a2744"};
  const CATLAB:any={frigo:"Frigo 0-4 C",freezer:"Congelato -18 C",banco:"Banco Servizio",dry:"Dispensa",default:"Cucina"};"""
assert txt.count(old_state)==1
txt = txt.replace(old_state, new_state)
print("✓ rinnovaLotti aggiunto")

# 2) emptyForm aggiunge categoria
old_form = 'const emptyForm={nome:"",dataProd:todayDate(),scadGiorni:"3",nota:"",allergeni:[] as string[],ingredienti:[{nome:"",lotto:"",qty:"",unit:"kg"}]};'
new_form = 'const emptyForm={nome:"",dataProd:todayDate(),scadGiorni:"3",nota:"",allergeni:[] as string[],categoria:"frigo",ingredienti:[{nome:"",lotto:"",qty:"",unit:"kg"}]};'
assert txt.count(old_form)==1
txt = txt.replace(old_form, new_form)
print("✓ categoria in emptyForm")

# 3) Aggiungi select categoria PRIMA degli ingredienti
old_ing = '          </div>\n\n          {/* Ingredienti */}'
new_ing = '''          </div>
          <div>
            <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:3}}>CONSERVAZIONE</div>
            <select value={slForm.categoria} onChange={e=>setSlForm((p:any)=>({...p,categoria:e.target.value}))}
              style={{width:"100%",padding:"7px 8px",borderRadius:8,border:"1px solid "+t.div,background:t.bgCard,color:t.ink,fontFamily:"var(--mono)",fontSize:12,outline:"none"}}>
              <option value="frigo">Frigo (0-4 C)</option>
              <option value="freezer">Congelato (-18 C)</option>
              <option value="banco">Banco Servizio</option>
              <option value="dry">Dispensa</option>
            </select>
          </div>

          {/* Ingredienti */}'''
assert txt.count(old_ing)==1
txt = txt.replace(old_ing, new_ing)
print("✓ select categoria aggiunta")

# 4) Salva categoria nel item
old_item = 'lotto:"KP-"+Date.now().toString(36).toUpperCase(),createdAt:nowISO()};'
new_item = 'lotto:"KP-"+Date.now().toString(36).toUpperCase(),categoria:slForm.categoria||"frigo",createdAt:nowISO()};'
assert txt.count(old_item)==1
txt = txt.replace(old_item, new_item)
print("✓ categoria salvata")

# 5) Bottone rinnova lotti + bordo colorato card
old_btn = '<button onClick={()=>setPrintItem(sl)} style={{padding:"5px 10px",borderRadius:7,border:"none",cursor:"pointer",background:t.secondary,color:"#fff",fontFamily:"var(--mono)",fontSize:9}}>🖨</button>'
new_btn = '<button onClick={()=>rinnovaLotti(sl)} style={{padding:"5px 10px",borderRadius:7,border:"none",cursor:"pointer",background:t.gold,color:"#fff",fontFamily:"var(--mono)",fontSize:9}} title="Aggiorna lotti">🔄</button>\n                <button onClick={()=>setPrintItem(sl)} style={{padding:"5px 10px",borderRadius:7,border:"none",cursor:"pointer",background:t.secondary,color:"#fff",fontFamily:"var(--mono)",fontSize:9}}>🖨</button>'
assert txt.count(old_btn)==1
txt = txt.replace(old_btn, new_btn)
print("✓ bottone rinnova lotti")

# 6) Bordo card colorato
old_card = '<div key={sl.id} style={{background:t.bgAlt,borderRadius:12,border:"2px solid "+(CATEGORIA_COLORS[sl.categoria||"default"]||CATEGORIA_COLORS.default),overflow:"hidden",boxShadow:"0 2px 8px "+(CATEGORIA_COLORS[sl.categoria||"default"]||CATEGORIA_COLORS.default)+"33"}}>'
new_card = '<div key={sl.id} style={{background:t.bgAlt,borderRadius:12,border:"2px solid "+(CATCOL[sl.categoria||"default"]||CATCOL.default),overflow:"hidden",boxShadow:"0 2px 8px "+(CATCOL[sl.categoria||"default"]||CATCOL.default)+"33"}}>'
if txt.count(old_card)==1:
    txt = txt.replace(old_card, new_card)
    print("✓ bordo card aggiornato")
else:
    old_card2 = '<div key={sl.id} style={{background:t.bgAlt,borderRadius:12,border:"1px solid "+t.div,overflow:"hidden"}}>'
    new_card2 = '<div key={sl.id} style={{background:t.bgAlt,borderRadius:12,border:"2px solid "+(CATCOL[sl.categoria||"default"]||CATCOL.default),overflow:"hidden"}}>'
    assert txt.count(old_card2)==1
    txt = txt.replace(old_card2, new_card2)
    print("✓ bordo card colorato (fallback)")

# 7) Bordo etichetta colorato + label categoria
old_et = '"3px solid #1a2744"'
new_et = '"3px solid "+(CATCOL[printItem.categoria||"default"]||CATCOL.default)'
if txt.count(old_et)==1:
    txt = txt.replace(old_et, new_et)
    print("✓ bordo etichetta colorato")

open(SRC, "w", encoding="utf-8").write(txt)
print("DONE")
