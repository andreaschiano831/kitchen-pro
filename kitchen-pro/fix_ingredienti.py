SRC = "/workspaces/kitchen-pro/kitchen-pro/src/KitchenPro.tsx"
txt = open(SRC, encoding="utf-8").read()

# 1) Aggiungi ingredienti:[] allo stato iniziale
old1 = "    tempLogs:[], lots:[], ricette:[],"
new1 = "    tempLogs:[], lots:[], ricette:[], ingredienti:[],"
assert txt.count(old1)==1
txt = txt.replace(old1, new1)
print("✓ ingredienti[] in initialState")

# 2) Aggiungi case INGREDIENTE_ADD nel reducer (dopo case STOCK_ADD)
old2 = "    case \"STOCK_ADD\":"
new2 = """    case "INGREDIENTE_ADD": {
      const k2=state.kitchens.find(k=>k.id===action.kitchenId);
      if(!k2) return state;
      return {...state, kitchens:state.kitchens.map(k=>k.id===action.kitchenId
        ? {...k, ingredienti:[action.item,...(k.ingredienti||[])]}
        : k)};
    }
    case "INGREDIENTE_REMOVE": {
      return {...state, kitchens:state.kitchens.map(k=>k.id===action.kitchenId
        ? {...k, ingredienti:(k.ingredienti||[]).filter((x:any)=>x.id!==action.id)}
        : k)};
    }
    case "STOCK_ADD":"""
assert txt.count(old2)==1
txt = txt.replace(old2, new2)
print("✓ INGREDIENTE_ADD/REMOVE reducer")

# 3) Aggiungi ingredienteAdd a useK()
old3 = "      stockAdd: (item) => {"
new3 = """      ingredienteAdd: (item:any) => { const k=kid(); if(k) dispatch({type:"INGREDIENTE_ADD",kitchenId:k,item:{...item,id:genId(),createdAt:nowISO()}}); },
      ingredienteRemove: (id:string) => { const k=kid(); if(k) dispatch({type:"INGREDIENTE_REMOVE",kitchenId:k,id}); },
      stockAdd: (item) => {"""
assert txt.count(old3)==1
txt = txt.replace(old3, new3)
print("✓ ingredienteAdd/Remove in useK()")

# 4) FatturaLottiView — aggiunge a ingredienti invece che a stock
# Trova destructuring di FatturaLottiView
old4 = "function FatturaLottiView({ t, stockAdd, toast }) {"
new4 = "function FatturaLottiView({ t, stockAdd, toast }) {\n  const { ingredienteAdd } = useK();"
assert txt.count(old4)==1
txt = txt.replace(old4, new4)
print("✓ ingredienteAdd in FatturaLottiView")

# 5) Sostituisci carica() in FatturaLottiView — salva in archivio ingredienti
old5 = """    const toLoad = preview.filter((_,i)=>sel[i]);
    if(!toLoad.length){toast("Seleziona almeno un prodotto","error");return;}
    toLoad.forEach((p:any)=>{
      stockAdd({
        name:p.nome, quantity:p.qty||1, unit:p.unit||"pz",
        location:p.location||(()=>{
          const n=(p.nome||'').toLowerCase();
          if(/congel|surgelat|frozen/.test(n)) return 'freezer';
          if(/secco|pasta|farina|zucchero|sale|olio|aceto|conserv/.test(n)) return 'dry';
          return 'fridge';
        })(), lot:p.lotto||undefined,
        expiresAt:p.scadenza?new Date(p.scadenza).toISOString():undefined,
        insertedDate:todayDate(),
      });
    });"""
new5 = """    const toLoad = preview.filter((_,i)=>sel[i]);
    if(!toLoad.length){toast("Seleziona almeno un prodotto","error");return;}
    const lastRes = (window as any).__lastFatturaResult||{};
    const fatturaId = genId();
    toLoad.forEach((p:any)=>{
      ingredienteAdd({
        fatturaId,
        fornitore: lastRes?.fornitore||"",
        dataFattura: lastRes?.data_fattura||todayDate(),
        numeroFattura: lastRes?.numero_fattura||"",
        nome: p.nome,
        lotto: p.lotto||null,
        qty: p.qty||1,
        unit: p.unit||"pz",
        prezzoUnitario: p.prezzo_unitario||null,
        prezzoTotale: p.prezzo_totale||null,
        scadenza: p.scadenza||null,
        usato: false,
      });
    });"""
assert txt.count(old5)==1
txt = txt.replace(old5, new5)
print("✓ carica() salva in archivio ingredienti")

# 6) Aggiorna messaggio toast e reset
old6 = '    toast(`✓ ${toLoad.length} prodotti caricati in giacenza`,"success");'
new6 = '    toast(`✓ ${toLoad.length} ingredienti salvati in archivio`,"success");'
assert txt.count(old6)==1
txt = txt.replace(old6, new6)
print("✓ toast aggiornato")

# 7) Aggiungi SpesaView destructuring ingredienteAdd
old7 = '  const { kitchen, allItems, stockAdd, spesaV2Add, spesaV2Update, spesaV2Toggle, spesaV2Remove, spesaV2Clear, currentRole } = useK();'
new7 = '  const { kitchen, allItems, stockAdd, spesaV2Add, spesaV2Update, spesaV2Toggle, spesaV2Remove, spesaV2Clear, currentRole, ingredienteAdd } = useK();'
assert txt.count(old7)==1
txt = txt.replace(old7, new7)
print("✓ ingredienteAdd in SpesaView")

# 8) Passa ingredienteAdd a FatturaLottiView
old8 = '{tab==="fattura"&&<FatturaLottiView t={t} stockAdd={stockAdd} toast={toast}/>'
new8 = '{tab==="fattura"&&<FatturaLottiView t={t} stockAdd={stockAdd} toast={toast}/>'
# già ok, FatturaLottiView ora usa useK() interno
print("✓ FatturaLottiView usa useK() interno")

open(SRC, "w", encoding="utf-8").write(txt)
print("DONE")
