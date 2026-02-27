import {
  useState, useEffect, useCallback, useRef, useMemo,
  useReducer, createContext, useContext,
} from "react";

/* ════════════════════════════════════════════════════════
   THEME SYSTEM — 4 curated palettes
   ════════════════════════════════════════════════════════ */
const THEMES = {
  carta: {
    name:"Carta Antica", icon:"📜",
    bg:"#F2EDE4", bgAlt:"#EBE4D8", bgCard:"#FFFFFF", bgCardAlt:"#FAF7F2", bgGlass:"rgba(242,237,228,0.90)",
    ink:"#151210", inkSoft:"#3D3530", inkMuted:"#7A7168", inkFaint:"#B0A899", inkGhost:"#D5CFC6",
    accent:"#8B1E2F", accentDeep:"#6A1525", accentGlow:"rgba(139,30,47,0.10)",
    secondary:"#182040", secondaryDeep:"#0F1530",
    gold:"#C19A3E", goldBright:"#D9B44A", goldDim:"rgba(193,154,62,0.30)", goldFaint:"rgba(193,154,62,0.08)",
    success:"#3D7A4A", warning:"#C19A3E", danger:"#8B1E2F",
    div:"rgba(21,18,16,0.07)", divStrong:"rgba(21,18,16,0.14)",
    shadow:"rgba(0,0,0,0.06)", shadowStrong:"rgba(0,0,0,0.12)", grain:0.30,
  },
  ardesia: {
    name:"Ardesia", icon:"🪨",
    bg:"#1A1D24", bgAlt:"#22262F", bgCard:"#262A34", bgCardAlt:"#2C313C", bgGlass:"rgba(26,29,36,0.92)",
    ink:"#E8E4DD", inkSoft:"#C5C0B8", inkMuted:"#8A857D", inkFaint:"#5C5850", inkGhost:"#3A3833",
    accent:"#C75B5B", accentDeep:"#A04040", accentGlow:"rgba(199,91,91,0.15)",
    secondary:"#4A6FA5", secondaryDeep:"#3A5A8A",
    gold:"#D4A843", goldBright:"#E8BC55", goldDim:"rgba(212,168,67,0.30)", goldFaint:"rgba(212,168,67,0.10)",
    success:"#5B9E6F", warning:"#D4A843", danger:"#C75B5B",
    div:"rgba(255,255,255,0.06)", divStrong:"rgba(255,255,255,0.12)",
    shadow:"rgba(0,0,0,0.25)", shadowStrong:"rgba(0,0,0,0.45)", grain:0.15,
  },
  notte: {
    name:"Blu Notte", icon:"🌙",
    bg:"#0D1117", bgAlt:"#151B26", bgCard:"#1A2233", bgCardAlt:"#1F2940", bgGlass:"rgba(13,17,23,0.92)",
    ink:"#E6E1D6", inkSoft:"#B8B3A8", inkMuted:"#6E6A62", inkFaint:"#484540", inkGhost:"#2E2C28",
    accent:"#E85D5D", accentDeep:"#C04040", accentGlow:"rgba(232,93,93,0.12)",
    secondary:"#5B8DD9", secondaryDeep:"#4070B8",
    gold:"#F0C050", goldBright:"#FFD466", goldDim:"rgba(240,192,80,0.28)", goldFaint:"rgba(240,192,80,0.08)",
    success:"#60B878", warning:"#F0C050", danger:"#E85D5D",
    div:"rgba(255,255,255,0.05)", divStrong:"rgba(255,255,255,0.10)",
    shadow:"rgba(0,0,0,0.35)", shadowStrong:"rgba(0,0,0,0.55)", grain:0.12,
  },
  display: {
    name:"Kitchen Display", icon:"📺",
    bg:"#000000", bgAlt:"#111111", bgCard:"#1A1A1A", bgCardAlt:"#222222", bgGlass:"rgba(0,0,0,0.95)",
    ink:"#FFFFFF", inkSoft:"#EEEEEE", inkMuted:"#AAAAAA", inkFaint:"#666666", inkGhost:"#333333",
    accent:"#FF3333", accentDeep:"#CC0000", accentGlow:"rgba(255,51,51,0.20)",
    secondary:"#FFD700", secondaryDeep:"#CCA800",
    gold:"#FFD700", goldBright:"#FFE033", goldDim:"rgba(255,215,0,0.30)", goldFaint:"rgba(255,215,0,0.10)",
    success:"#00CC44", warning:"#FFD700", danger:"#FF3333",
    div:"rgba(255,255,255,0.10)", divStrong:"rgba(255,255,255,0.20)",
    shadow:"rgba(0,0,0,0.60)", shadowStrong:"rgba(0,0,0,0.90)", grain:0,
  },
  avorio: {
    name:"Avorio Reale", icon:"👑",
    bg:"#FDFBF7", bgAlt:"#F5F1EA", bgCard:"#FFFFFF", bgCardAlt:"#FEFCF8", bgGlass:"rgba(253,251,247,0.90)",
    ink:"#1C1810", inkSoft:"#3E3A30", inkMuted:"#807A6E", inkFaint:"#ADA798", inkGhost:"#D8D2C8",
    accent:"#7A2842", accentDeep:"#5C1830", accentGlow:"rgba(122,40,66,0.08)",
    secondary:"#2A3F6A", secondaryDeep:"#1C2E52",
    gold:"#B08A30", goldBright:"#CCA040", goldDim:"rgba(176,138,48,0.28)", goldFaint:"rgba(176,138,48,0.06)",
    success:"#3A7848", warning:"#B08A30", danger:"#7A2842",
    div:"rgba(28,24,16,0.06)", divStrong:"rgba(28,24,16,0.12)",
    shadow:"rgba(0,0,0,0.04)", shadowStrong:"rgba(0,0,0,0.10)", grain:0.25,
  },
};

/* ════════════════════════════════════════════════════════
   STORE — useReducer + localStorage
   ════════════════════════════════════════════════════════ */
const STORAGE_KEY = "kitchen-pro-v4";
const nowISO  = () => new Date().toISOString();
const todayDate = () => new Date().toISOString().slice(0,10);
const genId   = () => Math.random().toString(36).slice(2,9) + Date.now().toString(36);

function mapStock(k, loc) {
  if (loc==="freezer") return k.freezer;
  if (loc==="fridge")  return k.fridge;
  if (loc==="dry")     return k.dry;
  return k.counter;
}
function setStock(k, loc, next) {
  if (loc==="freezer") return {...k, freezer:next};
  if (loc==="fridge")  return {...k, fridge:next};
  if (loc==="dry")     return {...k, dry:next};
  return {...k, counter:next};
}
function findLoc(k, id) {
  if (k.freezer.some(x=>x.id===id)) return "freezer";
  if (k.fridge.some(x=>x.id===id))  return "fridge";
  if (k.dry.some(x=>x.id===id))     return "dry";
  if (k.counter.some(x=>x.id===id)) return "counter";
  return null;
}
function mkKitchen(name, ownerName="Admin") {
  const owner = { id:genId(), name:ownerName.trim()||"Admin", role:"admin", joinedAt:nowISO() };
  return {
    id:genId(), name:name.trim(), ownerName:owner.name, createdAt:nowISO(),
    members:[owner], freezer:[], fridge:[], dry:[], counter:[],
    parByCategory:{}, shopping:[], ledger:[],
  };
}
function ensureKitchen(k) {
  return {
    ledger:[], shopping:[], parByCategory:{},
    freezer:[], fridge:[], dry:[], counter:[],
    members:[],
    // v3 — nuovi array
    preparazioni:[], mepItems:[],
    ordini:[], spesaV2:[],
    tempLogs:[], lots:[], ricette:[],
    wasteLog:[], tickets:[],
    service:null,
    ...k
  };
}

function reducer(state, action) {
  const { kitchens } = state;
  const mapK = (id, fn) => kitchens.map(k => k.id!==id ? k : fn(ensureKitchen(k)));

  switch (action.type) {
    case "KITCHEN_CREATE":
      return { ...state, kitchens:[...kitchens, action.kitchen], selectedKitchenId:action.kitchen.id, selectedMemberId:action.kitchen.members[0]?.id };
    case "KITCHEN_SELECT":
      return { ...state, selectedKitchenId:action.id };
    case "MEMBER_SELECT":
      return { ...state, selectedMemberId:action.id };
    case "MEMBER_ADD":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, members:[...k.members, action.member]})) };
    case "MEMBER_ROLE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, members:k.members.map(m=>m.id!==action.memberId?m:{...m,role:action.role})})) };
    case "MEMBER_REMOVE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, members:k.members.filter(m=>m.id!==action.memberId)})), selectedMemberId: state.selectedMemberId===action.memberId?undefined:state.selectedMemberId };
    case "PAR_CATEGORY":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, parByCategory:{...k.parByCategory,[action.key]:action.par}})) };
    case "STOCK_ADD":
      return { ...state, kitchens: mapK(action.kitchenId, k => { const loc=action.item.location; return setStock(k,loc,[action.item,...mapStock(k,loc)]); }) };
    case "ITEM_ADJUST":
      return { ...state, kitchens: mapK(action.kitchenId, k => { const loc=findLoc(k,action.id); if(!loc)return k; return setStock(k,loc,mapStock(k,loc).map(x=>x.id!==action.id?x:{...x,quantity:Math.max(0,(x.quantity||0)+action.delta)}).filter(x=>x.quantity>0)); }) };
    case "ITEM_REMOVE":
      return { ...state, kitchens: mapK(action.kitchenId, k => { const loc=findLoc(k,action.id); if(!loc)return k; return setStock(k,loc,mapStock(k,loc).filter(x=>x.id!==action.id)); }) };
    case "ITEM_PAR":
      return { ...state, kitchens: mapK(action.kitchenId, k => { const loc=findLoc(k,action.id); if(!loc)return k; return setStock(k,loc,mapStock(k,loc).map(x=>x.id!==action.id?x:{...x,parLevel:action.par})); }) };
    case "STOCK_MOVE": {
      return { ...state, kitchens: mapK(action.kitchenId, k => {
        const fromLoc = findLoc(k,action.id); if(!fromLoc)return k;
        const src = mapStock(k,fromLoc).find(x=>x.id===action.id); if(!src)return k;
        const qty = Math.min(Number(action.qty)||0, src.quantity); if(qty<=0)return k;
        const remaining = src.quantity - qty;
        const moved = {...src, id:genId(), location:action.to, quantity:qty, insertedAt:nowISO(), insertedDate:todayDate()};
        const ledgerRow = {id:genId(), at:nowISO(), itemId:src.id, name:src.name, qty, unit:src.unit, from:fromLoc, to:action.to, lot:src.lot};
        let upd = setStock(k, fromLoc, mapStock(k,fromLoc).map(x=>x.id!==action.id?x:{...x,quantity:remaining}).filter(x=>x.quantity>0));
        upd = setStock(upd, action.to, [moved, ...mapStock(upd,action.to)]);
        return {...upd, ledger:[ledgerRow, ...upd.ledger]};
      })};
    }
    case "SHOP_ADD":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, shopping:[action.item,...k.shopping]})) };
    case "SHOP_TOGGLE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, shopping:k.shopping.map(x=>x.id!==action.id?x:{...x,checked:!x.checked})})) };
    case "SHOP_REMOVE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, shopping:k.shopping.filter(x=>x.id!==action.id)})) };
    case "SHOP_CLEAR":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, shopping:k.shopping.filter(x=>!x.checked || (action.cat && x.category!==action.cat))})) };

    /* ── PREPARAZIONI ─────────────────────────────── */
    case "PREP_ADD":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, preparazioni:[action.prep, ...(k.preparazioni||[])]
      }))};
    case "PREP_UPDATE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, preparazioni:(k.preparazioni||[]).map(p=>p.id!==action.id?p:{...p,...action.patch})
      }))};
    case "PREP_REMOVE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, preparazioni:(k.preparazioni||[]).filter(p=>p.id!==action.id)
      }))};
    case "PREP_STATUS": {
      const now = nowISO();
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, preparazioni:(k.preparazioni||[]).map(p=>p.id!==action.id?p:{
          ...p, status:action.status,
          svoltaIl: action.status==="svolta"&&!p.svoltaIl ? now : p.svoltaIl,
          smistataIl: action.status==="smistata" ? now : p.smistataIl,
        })
      }))};
    }
    /* ── MEP ITEMS ─────────────────────────────────── */
    case "MEP_ITEM_ADD":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, mepItems:[action.item, ...(k.mepItems||[])]
      }))};
    case "MEP_ITEM_UPDATE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, mepItems:(k.mepItems||[]).map(x=>x.id!==action.id?x:{...x,...action.patch})
      }))};
    case "MEP_ITEM_REMOVE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, mepItems:(k.mepItems||[]).filter(x=>x.id!==action.id)
      }))};
    case "MEP_SERVICE_LEVEL":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, mepItems:(k.mepItems||[]).map(x=>x.id!==action.id?x:{...x,livelloServizio:action.level})
      }))};
    /* ── ECONOMATO ─────────────────────────────────── */
    case "ORDINE_ADD":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, ordini:[action.ordine, ...(k.ordini||[])]
      }))};
    case "ORDINE_UPDATE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, ordini:(k.ordini||[]).map(o=>o.id!==action.id?o:{...o,...action.patch})
      }))};
    case "RICEZIONE_CONFERMATA": {
      // UNICO punto che aggiorna stock da economato
      const ordine = state.kitchens.find(k=>k.id===action.kitchenId)?.ordini?.find(o=>o.id===action.ordineId);
      if(!ordine) return state;
      const nuoveGiacenze = (action.ricezioni||[]).map(r=>({
        id:genId(), name:r.nome, quantity:r.quantitaRicevuta, unit:r.unitaMisura,
        location:"dry", category:"economato",
        parLevel:0, expiresAt:r.scadeIl||null, lot:r.codiceLotto||null,
        prezzoUnitario:r.prezzoUnitario||null, // SOLO su questo oggetto in economato
        insertedAt:nowISO(), insertedDate:todayDate(),
        notes:`Ordine ${ordine.id.slice(-4)} · ${r.fornitore||""}`,
      }));
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k,
        dry:[...nuoveGiacenze, ...(k.dry||[])],
        ordini:(k.ordini||[]).map(o=>o.id!==action.ordineId?o:{
          ...o, status:"ricevuto", ricezioneConfermataIl:nowISO(),
        }),
      }))};
    }
    /* ── LISTA SPESA V2 (tipologia × frequenza) ─────── */
    case "SPESA_V2_ADD":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, spesaV2:[action.item, ...(k.spesaV2||[])]
      }))};
    case "SPESA_V2_TOGGLE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, spesaV2:(k.spesaV2||[]).map(x=>x.id!==action.id?x:{...x,checked:!x.checked})
      }))};
    case "SPESA_V2_REMOVE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, spesaV2:(k.spesaV2||[]).filter(x=>x.id!==action.id)
      }))};
    case "SPESA_V2_CLEAR":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, spesaV2:(k.spesaV2||[]).filter(x=>!x.checked)
      }))};
    /* ── WASTE LOG ──────────────────────────────────── */
    case "WASTE_LOG":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({
        ...k, wasteLog:[action.entry, ...(k.wasteLog||[])]
      }))};
    default: return state;
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { kitchens:[] };
    const p = JSON.parse(raw);
    if (!p || !Array.isArray(p.kitchens)) return { kitchens:[] };
    p.kitchens = p.kitchens.map(ensureKitchen);
    return p;
  } catch { return { kitchens:[] }; }
}

const KCtx = createContext(null);

function KitchenProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} }, [state]);

  const api = useMemo(() => {
    const kid = () => state.selectedKitchenId || state.kitchens[0]?.id;
    const curKitchen = () => state.kitchens.find(k=>k.id===kid());

    return {
      state,
      kitchen: curKitchen(),
      currentRole: () => { const k=curKitchen(); if(!k)return"admin"; const m=k.members.find(x=>x.id===state.selectedMemberId)||k.members[0]; return m?.role||"admin"; },
      allItems: () => { const k=curKitchen(); if(!k)return[]; return [...k.freezer,...k.fridge,...k.dry,...k.counter]; },

      createKitchen: (name, owner) => { if(!(name||"").trim())return; dispatch({type:"KITCHEN_CREATE", kitchen:mkKitchen(name,owner)}); },
      selectKitchen: (id) => dispatch({type:"KITCHEN_SELECT",id}),
      selectMember: (id) => dispatch({type:"MEMBER_SELECT",id}),

      addMember: (name, role="staff") => { const k=kid(); if(!k||!(name||"").trim())return; dispatch({type:"MEMBER_ADD",kitchenId:k,member:{id:genId(),name:name.trim(),role,joinedAt:nowISO()}}); },
      updateRole: (memberId, role) => { const k=kid(); if(k)dispatch({type:"MEMBER_ROLE",kitchenId:k,memberId,role}); },
      removeMember: (memberId) => { const k=kid(); if(k)dispatch({type:"MEMBER_REMOVE",kitchenId:k,memberId}); },

      setParCategory: (key, par) => { const k=kid(); if(k)dispatch({type:"PAR_CATEGORY",kitchenId:k,key,par:Math.max(0,Number(par)||0)}); },

      stockAdd: (item) => {
        const k=kid(); if(!k)return;
        const name=(item.name||"").trim(); const qty=Number(item.quantity);
        if(!name||!isFinite(qty)||qty<=0)return;
        dispatch({type:"STOCK_ADD",kitchenId:k,item:{
          id:genId(),name,quantity:qty,unit:item.unit||"pz",location:item.location||"fridge",
          insertedAt:item.insertedAt||nowISO(),insertedDate:item.insertedDate||todayDate(),
          expiresAt:item.expiresAt,lot:item.lot,notes:item.notes,category:item.category,parLevel:item.parLevel,
        }});
      },
      adjustItem: (id, delta) => { const k=kid(); if(k)dispatch({type:"ITEM_ADJUST",kitchenId:k,id,delta:Number(delta)||0}); },
      removeItem: (id) => { const k=kid(); if(k)dispatch({type:"ITEM_REMOVE",kitchenId:k,id}); },
      setItemPar: (id, par) => { const k=kid(); if(k)dispatch({type:"ITEM_PAR",kitchenId:k,id,par}); },
      moveStock: (id, qty, to) => { const k=kid(); if(k)dispatch({type:"STOCK_MOVE",kitchenId:k,id,qty,to}); },

      shopAdd: (name, qty, unit, category, notes) => {
        const k=kid(); if(!k)return;
        const n=(name||"").trim(); const q=Number(qty);
        if(!n||!isFinite(q)||q<=0)return;
        dispatch({type:"SHOP_ADD",kitchenId:k,item:{id:genId(),name:n,quantity:q,unit,category,notes:(notes||"").trim()||undefined,checked:false,createdAt:nowISO()}});
      },
      
      // ── PREPARAZIONI ──────────────────────────────
      prepAdd: (nome, qty, unit, categoria, reparto, turno, note) => {
        const k=kid(); if(!k||!nome.trim()) return;
        dispatch({type:"PREP_ADD", kitchenId:k, prep:{
          id:genId(), nome:nome.trim(), categoriaKey:categoria||"antipasti",
          reparto:reparto||"cucina_calda", turno:turno||"mattina",
          quantita:Number(qty)||1, unitaMisura:unit||"pz",
          status:"da_fare", destinazione:null,
          svoltaIl:null, smistataIl:null,
          scadeIl:null, note:note||null,
          createdAt:nowISO(),
        }});
      },
      prepUpdate: (id, patch) => { const k=kid(); if(k)dispatch({type:"PREP_UPDATE",kitchenId:k,id,patch}); },
      prepRemove: (id) => { const k=kid(); if(k)dispatch({type:"PREP_REMOVE",kitchenId:k,id}); },
      prepStatus: (id, status) => { const k=kid(); if(k)dispatch({type:"PREP_STATUS",kitchenId:k,id,status}); },
      // ── MEP ITEMS ─────────────────────────────────
      mepItemAdd: (item) => { const k=kid(); if(k)dispatch({type:"MEP_ITEM_ADD",kitchenId:k,item:{...item,id:genId(),createdAt:nowISO(),livelloServizio:4}}); },
      mepItemUpdate: (id, patch) => { const k=kid(); if(k)dispatch({type:"MEP_ITEM_UPDATE",kitchenId:k,id,patch}); },
      mepItemRemove: (id) => { const k=kid(); if(k)dispatch({type:"MEP_ITEM_REMOVE",kitchenId:k,id}); },
      mepServiceLevel: (id, level) => { const k=kid(); if(k)dispatch({type:"MEP_SERVICE_LEVEL",kitchenId:k,id,level}); },
      // ── ECONOMATO ─────────────────────────────────
      ordineAdd: (fornitore, items) => {
        const k=kid(); if(!k) return;
        dispatch({type:"ORDINE_ADD", kitchenId:k, ordine:{
          id:genId(), data:todayDate(), fornitore:fornitore||"",
          items:items||[], status:"bozza",
          inviatoIl:null, ricezioneConfermataIl:null, note:null,
        }});
      },
      ordineUpdate: (id, patch) => { const k=kid(); if(k)dispatch({type:"ORDINE_UPDATE",kitchenId:k,id,patch}); },
      confermRicezione: (ordineId, ricezioni) => { const k=kid(); if(k)dispatch({type:"RICEZIONE_CONFERMATA",kitchenId:k,ordineId,ricezioni}); },
      // ── SPESA V2 ──────────────────────────────────
      spesaV2Add: (nome, qty, unit, tipologia, frequenza, note) => {
        const k=kid(); if(!k||!nome.trim()) return;
        dispatch({type:"SPESA_V2_ADD", kitchenId:k, item:{
          id:genId(), nome:nome.trim(), quantita:Number(qty)||1, unitaMisura:unit||"pz",
          tipologia:tipologia||"alimenti", frequenza:frequenza||"giornaliero",
          note:note||null, checked:false, createdAt:nowISO(),
        }});
      },
      spesaV2Toggle: (id) => { const k=kid(); if(k)dispatch({type:"SPESA_V2_TOGGLE",kitchenId:k,id}); },
      spesaV2Remove: (id) => { const k=kid(); if(k)dispatch({type:"SPESA_V2_REMOVE",kitchenId:k,id}); },
      spesaV2Clear: () => { const k=kid(); if(k)dispatch({type:"SPESA_V2_CLEAR",kitchenId:k}); },
      // ── WASTE ─────────────────────────────────────
      logWaste: (entry) => { const k=kid(); if(k)dispatch({type:"WASTE_LOG",kitchenId:k,entry:{...entry,id:genId(),at:nowISO()}}); },
      shopToggle: (id) => { const k=kid(); if(k)dispatch({type:"SHOP_TOGGLE",kitchenId:k,id}); },
      shopRemove: (id) => { const k=kid(); if(k)dispatch({type:"SHOP_REMOVE",kitchenId:k,id}); },
      shopClear: (cat) => { const k=kid(); if(k)dispatch({type:"SHOP_CLEAR",kitchenId:k,cat}); },
    };
  }, [state]);

  return <KCtx.Provider value={api}>{children}</KCtx.Provider>;
}
const useK = () => useContext(KCtx);

/* ════════════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════════════ */
const ToastCtx = createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type="info") => {
    const id = genId();
    setToasts(p=>[...p, {id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), 3000);
  },[]);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div style={{position:"fixed",top:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:8}}>
        {toasts.map(t=>(
          <div key={t.id} style={{
            padding:"10px 18px",borderRadius:10,fontSize:12,fontFamily:"var(--mono)",fontWeight:500,
            letterSpacing:"0.04em",
            background: t.type==="success"?"#3D7A4A": t.type==="error"?"#8B1E2F":"#C19A3E",
            color:"#fff", boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
            animation:"toastIn 0.3s cubic-bezier(0.4,0,0.2,1) both",
          }}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);

/* ════════════════════════════════════════════════════════
   SPEECH HOOK
   ════════════════════════════════════════════════════════ */
function useSpeech(onResult) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const supported = typeof window!=="undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = useCallback(()=>{
    if(!supported||listening) return;
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    const r = new SR(); r.lang="it-IT"; r.interimResults=false; r.maxAlternatives=1;
    r.onresult = e => { try { onResult(e.results[0][0].transcript); }catch{} };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recRef.current = r;
    try { r.start(); setListening(true); } catch { setListening(false); }
  },[supported,listening,onResult]);

  const stop = useCallback(()=>{ recRef.current?.stop(); setListening(false); },[]);
  useEffect(()=>()=>recRef.current?.abort(),[]);
  return { listening, start, stop, supported };
}


/* ════════════════════════════════════════════════════════
   CATEGORIE_MENU — fonte unica di verità per MEP + Preparazioni
   Tutte le etichette in italiano · ordine di servizio
   ════════════════════════════════════════════════════════ */
const CATEGORIE_MENU = [
  {key:"antipasti",   label:"Antipasti",   icon:"🫕",  reparto:"cucina",      ord:1},
  {key:"primi",       label:"Primi",       icon:"🍝",  reparto:"cucina",      ord:2},
  {key:"secondi",     label:"Secondi",     icon:"🥩",  reparto:"cucina",      ord:3},
  {key:"pasticceria", label:"Pasticceria", icon:"🍮",  reparto:"pasticceria", ord:4},
  {key:"colazioni",   label:"Colazioni",   icon:"☕",  reparto:"pasticceria", ord:5},
  {key:"buffet",      label:"Buffet",      icon:"🎪",  reparto:"cucina",      ord:6},
  {key:"eventi",      label:"Eventi",      icon:"🎊",  reparto:"cucina",      ord:7},
  {key:"svolte",      label:"Svolte",      icon:"✅",  reparto:"cucina",      ord:8}, // auto-populated
];

/* ════════════════════════════════════════════════════════
   TIPOLOGIE SPESA + FREQUENZE
   ════════════════════════════════════════════════════════ */
const SPESA_TIPOLOGIE  = ["alimenti","economato","altro"];
const SPESA_FREQUENZE  = ["giornaliero","settimanale"];
const SPESA_TIP_ICONS  = {alimenti:"🥩", economato:"📦", altro:"📋"};
const SPESA_TIP_LABELS = {alimenti:"Alimenti", economato:"Economato", altro:"Altro"};
const SPESA_FREQ_LABELS= {giornaliero:"Giornaliero", settimanale:"Settimanale"};

/* ════════════════════════════════════════════════════════
   callAI — pattern unificato (usato da tutti i componenti)
   ════════════════════════════════════════════════════════ */
async function callAI({ systemPrompt, userContext, maxTokens=1024, expectJSON=false }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:maxTokens,
      system:systemPrompt,
      messages:[{role:"user", content:typeof userContext==="string"?userContext:JSON.stringify(userContext)}],
    }),
  });
  if(!res.ok) throw new Error(`AI error: ${res.status}`);
  const data = await res.json();
  const text = data.content?.[0]?.text||"";
  if(expectJSON) return JSON.parse(text.replace(/```json|```/g,"").trim());
  return text;
}

/* ════════════════════════════════════════════════════════
   ALERT SELECTORS — stati derivati, mai salvati in store
   ════════════════════════════════════════════════════════ */
function computeStatoScadenza(scadeIl) {
  if(!scadeIl) return "nessuna";
  const ore = (new Date(scadeIl)-Date.now())/3_600_000;
  if(ore<=0)  return "scaduta";
  if(ore<=12) return "critica";
  if(ore<=48) return "in_scadenza";
  return "ok";
}
function computeStatoQuantita(qty, min) {
  if((qty||0)<=0)          return "esaurita";
  if(min>0 && qty<=min)    return "bassa";
  return "ok";
}
function selectAlertCritici(kitchen) {
  if(!kitchen) return [];
  const tutti = [...(kitchen.freezer||[]),...(kitchen.fridge||[]),...(kitchen.dry||[]),...(kitchen.counter||[])];
  const alerts = [];
  tutti.forEach(g=>{
    const sc = computeStatoScadenza(g.expiresAt);
    const sq = computeStatoQuantita(g.quantity, g.parLevel||0);
    if(sc==="scaduta")      alerts.push({id:g.id+"_sc0", tipo:"scaduta",      priorita:0, nome:g.name, location:g.location, valore:"SCADUTO"});
    else if(sc==="critica") alerts.push({id:g.id+"_sc1", tipo:"critica",      priorita:1, nome:g.name, location:g.location, valore:Math.round((new Date(g.expiresAt)-Date.now())/3_600_000)+"h"});
    else if(sc==="in_scadenza") alerts.push({id:g.id+"_sc2", tipo:"in_scadenza", priorita:2, nome:g.name, location:g.location, valore:Math.round((new Date(g.expiresAt)-Date.now())/3_600_000)+"h"});
    if(sq==="esaurita")     alerts.push({id:g.id+"_sq0", tipo:"scorta_zero",  priorita:0, nome:g.name, location:g.location, valore:"ESAURITO"});
    else if(sq==="bassa")   alerts.push({id:g.id+"_sq3", tipo:"scorta_bassa", priorita:3, nome:g.name, location:g.location, valore:g.quantity+" "+g.unit});
  });
  return alerts.sort((a,b)=>a.priorita-b.priorita);
}

/* ════════════════════════════════════════════════════════
   UTILITY
   ════════════════════════════════════════════════════════ */
const CATEGORIES = {
  proteine:"Proteine",pesce:"Pesce",verdure:"Verdure",erbe:"Erbe",
  dairy:"Latticini",cereali:"Cereali",grassi:"Grassi",acidi:"Acidi",
  spezie:"Spezie",fondi:"Fondi",beverage:"Beverage",secco:"Secco",
};
const PAR_PRESET = {proteine:6,pesce:4,verdure:8,erbe:12,dairy:6,cereali:3,grassi:4,acidi:6,spezie:10,fondi:4,beverage:6,secco:5};
const UNITS = ["pz","g","kg","ml","l","vac","busta","brik","latta","box","vasch"];
const ROLES = ["admin","chef","sous-chef","capo-partita","commis","stagista","staff","fb","mm"];
const CAN_EDIT = ["admin","chef","sous-chef","capo-partita"];

function hoursUntil(iso) {
  if(!iso) return null;
  return (new Date(iso)-new Date())/3600000;
}
function expiryBadge(iso) {
  const h = hoursUntil(iso);
  if(h===null) return null;
  if(h<=0)  return {label:"SCADUTO",  color:"#fff", bg:"#8B1E2F"};
  if(h<=24) return {label:"≤24h",     color:"#fff", bg:"#8B1E2F"};
  if(h<=72) return {label:"≤72h",     color:"#fff", bg:"#C19A3E"};
  return null;
}
function stepFor(unit) {
  if(["g","ml"].includes(unit)) return [100,500];
  if(["kg","l"].includes(unit)) return [0.5,1];
  return [1,5];
}
function fmtDate(iso) { return iso ? iso.slice(0,10) : "—"; }

/* ════════════════════════════════════════════════════════
   MICRO-COMPONENTS
   ════════════════════════════════════════════════════════ */
function LiveClock({ t }) {
  const [now,setNow]=useState(new Date());
  useEffect(()=>{ const i=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(i);},[]);
  return (
    <span className="mono" style={{fontSize:13,color:t.gold,letterSpacing:"0.06em"}}>
      {now.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
    </span>
  );
}

function BarMini({ value, max, t, color }) {
  const pct = Math.min((value/max)*100,100);
  const isLow = value/max < 0.25;
  const c = color||(isLow?t.danger:pct<50?t.warning:t.success);
  return (
    <div style={{height:4,background:t.div,borderRadius:2,overflow:"hidden",flex:1}}>
      <div style={{height:"100%",width:`${pct}%`,background:c,borderRadius:2,transition:"width 0.8s cubic-bezier(0.4,0,0.2,1)"}}/>
    </div>
  );
}

function Badge({ label, color, bg, style:sx={} }) {
  return (
    <span className="mono" style={{fontSize:8,letterSpacing:"0.1em",fontWeight:500,padding:"3px 9px",borderRadius:4,color,background:bg,whiteSpace:"nowrap",...sx}}>
      {label}
    </span>
  );
}

function Btn({ onClick, disabled, children, variant="primary", t, style:sx={} }) {
  const variants = {
    primary:{ background:`linear-gradient(135deg, ${t.secondary}, ${t.secondaryDeep})`, color:"#fff", border:"none" },
    danger: { background:`linear-gradient(135deg, ${t.accent}, ${t.accentDeep})`, color:"#fff", border:"none" },
    ghost:  { background:"transparent", color:t.inkMuted, border:`1px solid ${t.div}` },
    gold:   { background:`linear-gradient(135deg, ${t.gold}, ${t.goldBright})`, color:"#fff", border:"none" },
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{
      padding:"8px 18px",borderRadius:8,cursor:disabled?"not-allowed":"pointer",
      fontSize:10,fontFamily:"var(--mono)",fontWeight:500,letterSpacing:"0.08em",
      opacity:disabled?0.45:1,transition:"all 0.2s",...variants[variant],...sx,
    }}
    onMouseEnter={e=>{if(!disabled)e.currentTarget.style.filter="brightness(1.08)";}}
    onMouseLeave={e=>{e.currentTarget.style.filter="none";}}
    >{children}</button>
  );
}

function LuxInput({ value, onChange, placeholder, type="text", t, style:sx={} }) {
  return (
    <input value={value} onChange={onChange} type={type} placeholder={placeholder}
      style={{
        width:"100%",padding:"9px 14px",borderRadius:8,fontSize:12,fontFamily:"var(--serif)",
        background:t.bgCardAlt,color:t.ink,border:`1px solid ${t.div}`,outline:"none",
        transition:"border-color 0.2s",...sx,
      }}
      onFocus={e=>e.target.style.borderColor=t.gold}
      onBlur={e=>e.target.style.borderColor=t.div}
    />
  );
}

function LuxSelect({ value, onChange, children, t, style:sx={} }) {
  return (
    <select value={value} onChange={onChange} style={{
      width:"100%",padding:"9px 14px",borderRadius:8,fontSize:12,fontFamily:"var(--mono)",
      background:t.bgCardAlt,color:t.ink,border:`1px solid ${t.div}`,outline:"none",cursor:"pointer",...sx,
    }}>{children}</select>
  );
}

function VoiceBtn({ t, onResult }) {
  const speech = useSpeech(onResult);
  if(!speech.supported) return null;
  return (
    <button onClick={speech.listening?speech.stop:speech.start} style={{
      width:34,height:34,borderRadius:"50%",border:"none",cursor:"pointer",
      background:speech.listening?`linear-gradient(135deg,${t.accent},${t.accentDeep})`:`${t.div}`,
      display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
      flexShrink:0,transition:"all 0.2s",
      animation:speech.listening?"pulse 1s ease-in-out infinite":"none",
    }} title={speech.listening?"Stop":"Parla"}>🎤</button>
  );
}

function Card({ children, t, style:sx={}, glow=false }) {
  return (
    <div style={{
      background:t.bgCard,borderRadius:14,border:`1px solid ${glow?t.accent+"30":t.div}`,
      boxShadow:glow?`0 4px 20px ${t.accentGlow}`:`0 2px 12px ${t.shadow}`,
      overflow:"hidden",transition:"all 0.3s",...sx,
    }}>{children}</div>
  );
}

function CardHeader({ title, right, t }) {
  return (
    <div style={{padding:"16px 22px",borderBottom:`1px solid ${t.div}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span className="mono" style={{fontSize:9,letterSpacing:"0.14em",color:t.inkMuted,fontWeight:500,textTransform:"uppercase"}}>{title}</span>
      {right}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SETUP SCREEN
   ════════════════════════════════════════════════════════ */
function SetupScreen({ t }) {
  const { createKitchen } = useK();
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:t.bg}}>
      <Card t={t} style={{width:420,padding:40}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{
            width:64,height:64,borderRadius:"50%",margin:"0 auto 16px",
            background:`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`,
            border:`2px solid ${t.goldBright}`,display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            <span className="mono" style={{fontSize:11,color:t.goldBright}}>★★★</span>
          </div>
          <div style={{fontFamily:"var(--serif)",fontSize:26,fontWeight:500,color:t.ink,marginBottom:6}}>Kitchen Pro</div>
          <div className="mono" style={{fontSize:8,letterSpacing:"0.2em",color:t.inkFaint}}>CREA LA TUA CUCINA</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <LuxInput value={name} onChange={e=>setName(e.target.value)} placeholder="Nome cucina / ristorante" t={t}/>
          <LuxInput value={owner} onChange={e=>setOwner(e.target.value)} placeholder="Tuo nome (admin)" t={t}/>
          <Btn t={t} onClick={()=>createKitchen(name,owner)} disabled={!name.trim()} variant="primary" sx={{marginTop:8}}>
            Crea Cucina
          </Btn>
        </div>
      </Card>
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   ALERT BANNER — sistema a priorità, si attiva on mount Preparazioni
   P0=rosso lampeggiante · P1=rosso · P2=arancio · P3=giallo
   ════════════════════════════════════════════════════════ */
const ALERT_COLORS = {
  scaduta:      {bg:"#8B1E2F", border:"#FF3333", label:"SCADUTO"},
  critica:      {bg:"rgba(139,30,47,0.15)", border:"#8B1E2F", label:"CRITICO"},
  in_scadenza:  {bg:"rgba(193,154,62,0.15)", border:"#C19A3E", label:"IN SCADENZA"},
  scorta_zero:  {bg:"rgba(139,30,47,0.15)", border:"#8B1E2F", label:"ESAURITO"},
  scorta_bassa: {bg:"rgba(193,154,62,0.10)", border:"#C19A3E", label:"SCORTA BASSA"},
};
const LOCATION_ICONS = {freezer:"❄️", fridge:"🧊", dry:"🏺", counter:"🔲", economato:"📦"};

function AlertBanner({ alerts, t, onDismiss }) {
  const [dismissed, setDismissed] = useState(new Set());
  const visible = alerts.filter(a=>!dismissed.has(a.id));
  if(!visible.length) return null;

  const critici    = visible.filter(a=>a.priorita<=1);
  const attenzione = visible.filter(a=>a.priorita===2);
  const info       = visible.filter(a=>a.priorita===3);

  return (
    <div style={{marginBottom:20,display:"flex",flexDirection:"column",gap:8}}>
      {critici.map(a=>{
        const style = ALERT_COLORS[a.tipo]||ALERT_COLORS.critica;
        return (
          <div key={a.id} style={{
            display:"flex",alignItems:"center",gap:12,padding:"12px 16px",
            borderRadius:10,border:`1.5px solid ${style.border}`,background:style.bg,
            animation:a.priorita===0?"pulse 1.5s ease-in-out infinite":undefined,
          }}>
            <span style={{fontSize:18,flexShrink:0}}>{LOCATION_ICONS[a.location]||"⚠️"}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,color:t.ink,fontWeight:500}}>
                {a.nome}
              </div>
              <div className="mono" style={{fontSize:9,color:style.border,marginTop:2}}>
                {style.label} · {(a.location||"").toUpperCase()} · {a.valore}
              </div>
            </div>
            <button onClick={()=>setDismissed(p=>new Set([...p,a.id]))} style={{
              background:"none",border:"none",color:t.inkFaint,cursor:"pointer",fontSize:16,padding:4,
              minWidth:32,minHeight:32,display:"flex",alignItems:"center",justifyContent:"center",
            }}>✕</button>
          </div>
        );
      })}

      {attenzione.length>0&&(
        <details style={{background:ALERT_COLORS.in_scadenza.bg,border:`1px solid ${ALERT_COLORS.in_scadenza.border}`,borderRadius:10,padding:"10px 14px"}}>
          <summary style={{cursor:"pointer",fontFamily:"var(--mono)",fontSize:10,color:t.warning||"#C19A3E",letterSpacing:"0.08em",listStyle:"none"}}>
            ⚠ {attenzione.length} prodotti in scadenza (espandi)
          </summary>
          <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
            {attenzione.map(a=>(
              <div key={a.id} style={{fontSize:12,fontFamily:"var(--serif)",fontStyle:"italic",color:t.ink,padding:"3px 0"}}>
                · {a.nome} — {a.valore} · {(a.location||"").toUpperCase()}
              </div>
            ))}
          </div>
        </details>
      )}

      {info.length>0&&(
        <details style={{background:ALERT_COLORS.scorta_bassa.bg,border:`1px solid ${ALERT_COLORS.scorta_bassa.border}`,borderRadius:10,padding:"10px 14px"}}>
          <summary style={{cursor:"pointer",fontFamily:"var(--mono)",fontSize:10,color:t.warning||"#C19A3E",letterSpacing:"0.08em",listStyle:"none"}}>
            📉 {info.length} scorte basse (espandi)
          </summary>
          <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
            {info.map(a=>(
              <div key={a.id} style={{fontSize:12,fontFamily:"var(--serif)",fontStyle:"italic",color:t.ink,padding:"3px 0"}}>
                · {a.nome} — {a.valore}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   PREPARAZIONI VIEW v3
   Tab: Tutte | Per categoria | Svolte (auto) | Congelatore
   Alert on mount: scadenze + scorte basse
   ════════════════════════════════════════════════════════ */
function PreparazioniView({ t }) {
  const { kitchen, prepAdd, prepUpdate, prepRemove, prepStatus, allItems, currentRole } = useK();
  const toast = useToast();
  const canEdit = CAN_EDIT.includes(currentRole());

  const preps     = kitchen?.preparazioni||[];
  const oggi      = todayDate();
  const [tab,     setTab]   = useState("tutte");
  const [catFil,  setCatFil]= useState("tutti");
  const [showForm,setShowForm]=useState(false);
  const [form, setForm] = useState({
    nome:"", qty:"1", unit:"pz",
    categoria:"antipasti", reparto:"cucina_calda",
    turno:"mattina", note:"",
  });

  // ── Alert on mount ─────────────────────────────────
  const [alerts, setAlerts] = useState([]);
  useEffect(()=>{
    const a = selectAlertCritici(kitchen);
    setAlerts(a);
    if(a.length>0) toast(`${a.length} alert attivi — controlla frigo e congelatore`,"error");
  }, []);

  // ── Svolte oggi (auto) ─────────────────────────────
  const svolteOggi = useMemo(()=>
    preps.filter(p=>p.status==="svolta"&&(p.svoltaIl||"").startsWith(oggi)),
    [preps, oggi]
  );

  // ── Congelatore ────────────────────────────────────
  const inCongelatore = kitchen?.freezer||[];

  function save() {
    if(!form.nome.trim()) { toast("Inserisci il nome","error"); return; }
    prepAdd(form.nome,form.qty,form.unit,form.categoria,form.reparto,form.turno,form.note);
    toast(`${form.nome} aggiunta`,"success");
    setForm({nome:"",qty:"1",unit:"pz",categoria:"antipasti",reparto:"cucina_calda",turno:"mattina",note:""});
    setShowForm(false);
  }

  const TURNI = [{k:"mattina",l:"🌅 Mattina"},{k:"pomeriggio",l:"☀️ Pomeriggio"},{k:"sera",l:"🌙 Sera"}];
  const REPARTI = [{k:"cucina_calda",l:"🔥 Cucina"},{k:"pasticceria",l:"🍮 Pasticceria"},{k:"garde_manger",l:"🥗 Garde M."},{k:"pesce",l:"🐟 Pesce"}];

  const filteredPreps = useMemo(()=>{
    if(tab==="svolte") return svolteOggi;
    if(tab==="congelatore") return [];
    let p = [...preps];
    if(tab==="categoria" && catFil!=="tutti") p=p.filter(x=>x.categoriaKey===catFil);
    return p;
  },[preps,tab,catFil,svolteOggi]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Alert banner — priorità massima */}
      {alerts.length>0&&<AlertBanner alerts={alerts} t={t} onDismiss={id=>setAlerts(p=>p.filter(a=>a.id!==id))}/>}

      {/* Header actions */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        {[
          {k:"tutte",   l:"📋 Tutte"},
          {k:"categoria",l:"🗂 Categoria"},
          {k:"svolte",  l:`✅ Svolte oggi (${svolteOggi.length})`},
          {k:"congelatore",l:`❄️ Congelatore (${inCongelatore.length})`},
        ].map(({k,l})=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:"8px 16px",borderRadius:10,border:"none",cursor:"pointer",
            fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.06em",
            background:tab===k?`linear-gradient(135deg,${t.accent},${t.accentDeep})`:t.bgCard,
            color:tab===k?"#fff":t.inkMuted,boxShadow:`0 1px 4px ${t.shadow}`,transition:"all 0.2s",
          }}>{l}</button>
        ))}
        {canEdit&&(
          <button onClick={()=>setShowForm(f=>!f)} style={{
            marginLeft:"auto",padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",
            background:`linear-gradient(135deg,${t.gold},${t.goldBright})`,color:"#fff",
            fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.06em",
          }}>+ Nuova Prep</button>
        )}
      </div>

      {/* Filtro categoria */}
      {tab==="categoria"&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[{key:"tutti",label:"⭐ Tutti"},...CATEGORIE_MENU.filter(c=>c.key!=="svolte")].map(c=>(
            <button key={c.key} onClick={()=>setCatFil(c.key)} style={{
              padding:"5px 12px",borderRadius:8,border:"none",cursor:"pointer",
              fontFamily:"var(--mono)",fontSize:9,
              background:catFil===c.key?t.accent:t.bgCard,
              color:catFil===c.key?"#fff":t.inkMuted,transition:"all 0.15s",
            }}>{c.icon||""} {c.label}</button>
          ))}
        </div>
      )}

      {/* Form nuova prep */}
      {showForm&&canEdit&&(
        <Card t={t} style={{padding:20}}>
          <div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:12}}>NUOVA PREPARAZIONE</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <LuxInput value={form.nome} onChange={e=>setForm(p=>({...p,nome:e.target.value}))}
              placeholder="Nome preparazione" t={t} style={{gridColumn:"1/-1"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <LuxInput value={form.qty} onChange={e=>setForm(p=>({...p,qty:e.target.value}))} type="number" placeholder="Qtà" t={t}/>
              <LuxSelect value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} t={t}>
                {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </LuxSelect>
            </div>
            <LuxSelect value={form.categoria} onChange={e=>setForm(p=>({...p,categoria:e.target.value}))} t={t}>
              {CATEGORIE_MENU.filter(c=>c.key!=="svolte").map(c=>(
                <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
              ))}
            </LuxSelect>
            <LuxSelect value={form.reparto} onChange={e=>setForm(p=>({...p,reparto:e.target.value}))} t={t}>
              {REPARTI.map(r=><option key={r.k} value={r.k}>{r.l}</option>)}
            </LuxSelect>
            <LuxSelect value={form.turno} onChange={e=>setForm(p=>({...p,turno:e.target.value}))} t={t}>
              {TURNI.map(r=><option key={r.k} value={r.k}>{r.l}</option>)}
            </LuxSelect>
            <LuxInput value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} placeholder="Note tecniche" t={t}/>
          </div>
          <Btn t={t} variant="gold" onClick={save} disabled={!form.nome.trim()}>+ Aggiungi Preparazione</Btn>
        </Card>
      )}

      {/* Vista Congelatore */}
      {tab==="congelatore"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {inCongelatore.length===0&&(
            <div style={{textAlign:"center",padding:"48px 0",color:t.inkFaint,fontFamily:"var(--serif)",fontSize:18,fontStyle:"italic"}}>
              Congelatore vuoto
            </div>
          )}
          {inCongelatore.map(item=>{
            const badge=expiryBadge(item.expiresAt);
            return (
              <Card key={item.id} t={t} style={{padding:"14px 20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:20}}>❄️</span>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:14,color:t.ink}}>{item.name}</div>
                    <div className="mono" style={{fontSize:9,color:t.inkFaint,marginTop:2}}>
                      {item.quantity} {item.unit}
                      {item.expiresAt&&` · Scad. ${fmtDate(item.expiresAt)}`}
                      {item.lot&&` · Lotto: ${item.lot}`}
                    </div>
                  </div>
                  {badge&&<span style={{padding:"3px 8px",borderRadius:6,background:badge.bg,color:badge.color,fontFamily:"var(--mono)",fontSize:9}}>{badge.label}</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Vista Svolte */}
      {tab==="svolte"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {svolteOggi.length===0&&(
            <div style={{textAlign:"center",padding:"48px 0",color:t.inkFaint}}>
              <div style={{fontFamily:"var(--serif)",fontSize:18,fontStyle:"italic",marginBottom:8}}>Nessuna preparazione svolta oggi</div>
              <div className="mono" style={{fontSize:9}}>SI POPOLA AUTOMATICAMENTE</div>
            </div>
          )}
          {svolteOggi.map(prep=>(
            <PrepCard key={prep.id} prep={prep} t={t} canEdit={canEdit}
              onStatus={prepStatus} onRemove={prepRemove}/>
          ))}
        </div>
      )}

      {/* Vista principale (Tutte / Categoria) */}
      {(tab==="tutte"||tab==="categoria")&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filteredPreps.length===0&&(
            <div style={{textAlign:"center",padding:"48px 0",color:t.inkFaint}}>
              <div style={{fontFamily:"var(--serif)",fontSize:18,fontStyle:"italic",marginBottom:8}}>Nessuna preparazione</div>
              {canEdit&&<div className="mono" style={{fontSize:9}}>USA IL PULSANTE + PER AGGIUNGERNE UNA</div>}
            </div>
          )}
          {filteredPreps.map(prep=>(
            <PrepCard key={prep.id} prep={prep} t={t} canEdit={canEdit}
              onStatus={prepStatus} onRemove={prepRemove}/>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── PrepCard ── */
function PrepCard({ prep, t, canEdit, onStatus, onRemove }) {
  const [exp, setExp] = useState(false);
  const cat = CATEGORIE_MENU.find(c=>c.key===prep.categoriaKey);
  const STATUS_COLORS = {
    da_fare:"#7A7168", in_corso:"#C19A3E",
    svolta:"#3D7A4A",  smistata:"#182040",
  };
  const STATUS_LABELS = {
    da_fare:"Da fare", in_corso:"In corso",
    svolta:"Svolta",  smistata:"Smistata",
  };
  const sc = prep.status||"da_fare";

  return (
    <Card t={t} style={{padding:0}}>
      <div style={{padding:"13px 18px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}
        onClick={()=>setExp(e=>!e)}>
        <span style={{fontSize:18,flexShrink:0}}>{cat?.icon||"📋"}</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:14,color:t.ink,fontWeight:500}}>
            {prep.nome}
          </div>
          <div className="mono" style={{fontSize:8,color:t.inkFaint,marginTop:2}}>
            {prep.quantita} {prep.unitaMisura}
            {prep.turno&&` · ${prep.turno}`}
            {prep.reparto&&` · ${prep.reparto.replace("_"," ")}`}
          </div>
        </div>
        <span style={{
          padding:"3px 10px",borderRadius:6,fontSize:9,fontFamily:"var(--mono)",
          background:STATUS_COLORS[sc]+"22",border:`1px solid ${STATUS_COLORS[sc]}44`,color:STATUS_COLORS[sc],
        }}>{STATUS_LABELS[sc]}</span>
        <span style={{color:t.inkFaint,fontSize:12}}>{exp?"▲":"▼"}</span>
      </div>
      {exp&&canEdit&&(
        <div style={{padding:"0 18px 14px",borderTop:`1px solid ${t.div}`}}>
          {prep.note&&<div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.inkSoft,padding:"8px 0",marginBottom:8}}>· {prep.note}</div>}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {Object.entries(STATUS_LABELS).map(([k,l])=>(
              <button key={k} onClick={()=>onStatus(prep.id,k)} style={{
                padding:"5px 10px",borderRadius:8,border:"none",cursor:"pointer",fontSize:10,
                background:sc===k?STATUS_COLORS[k]:t.bgAlt,
                color:sc===k?"#fff":t.inkMuted,transition:"all 0.15s",fontFamily:"var(--mono)",
              }}>{l}</button>
            ))}
            <button onClick={()=>onRemove(prep.id)} style={{
              ...{padding:"5px 10px",borderRadius:8,border:"none",cursor:"pointer",fontSize:10,fontFamily:"var(--mono)"},
              background:t.accentGlow,color:t.danger,marginLeft:"auto",
            }}>✕ Rimuovi</button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ════════════════════════════════════════════════════════
   DASHBOARD
   ════════════════════════════════════════════════════════ */
function DashboardView({ t }) {
  const { kitchen, allItems } = useK();
  if (!kitchen) return null;

  const items = allItems();
  const now = new Date();
  const expired  = items.filter(x=>x.expiresAt && new Date(x.expiresAt)<now);
  const urgent   = items.filter(x=>{ const h=hoursUntil(x.expiresAt); return h!==null&&h>0&&h<=72; });
  const k = kitchen;
  const parKeys  = Object.keys(PAR_PRESET);
  const lowItems = items.filter(x=>{
    const par = x.parLevel ?? (x.category ? PAR_PRESET[x.category] : null) ?? (k.parByCategory[x.category]||0);
    return par>0 && x.quantity<par;
  });

  const kpis = [
    {label:"REFERENZE",val:items.length,sub:"totali",icon:"◆"},
    {label:"SCADUTI",val:expired.length,sub:"articoli",icon:"⚠",hi:expired.length>0},
    {label:"URGENTI ≤72h",val:urgent.length,sub:"articoli",icon:"⏱",hi:urgent.length>0},
    {label:"SOTTO PAR",val:lowItems.length,sub:"articoli",icon:"↓",hi:lowItems.length>0},
  ];

  const isMobileView = typeof window !== "undefined" && window.innerWidth < 768;
  const { setSection } = { setSection: () => {} }; // navigazione via event
  function navTo(sec) { window.dispatchEvent(new CustomEvent("kp-nav", {detail:{section:sec}})); }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>

      {/* Quick Actions — solo mobile, above the fold */}
      {isMobileView&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[
            {l:"Aggiungi\nGiacenza", sec:"giacenze", c:t.accent, icon:"◆"},
            {l:"Nuova\nPrep",        sec:"preparazioni", c:t.secondary, icon:"📋"},
            {l:"Avvia\nServizio",    sec:"servizio", c:t.success, icon:"▶"},
          ].map(qa=>(
            <button key={qa.sec} onClick={()=>navTo(qa.sec)} style={{
              minHeight:80,borderRadius:14,border:`1px solid ${qa.c}33`,
              background:`linear-gradient(145deg,${qa.c}20,${qa.c}08)`,
              cursor:"pointer",display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",gap:6,
              boxShadow:`0 4px 16px ${qa.c}18`,transition:"all 0.2s",padding:12,
            }}>
              <span style={{fontSize:20}}>{qa.icon}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.06em",color:qa.c,textAlign:"center",whiteSpace:"pre-line",lineHeight:1.4}}>{qa.l}</span>
            </button>
          ))}
        </div>
      )}

      {/* KPI */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14}}>
        {kpis.map((kpi,i)=>(
          <Card key={i} t={t} glow={kpi.hi} style={{padding:"20px 22px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <span className="mono" style={{fontSize:8,letterSpacing:"0.16em",color:t.inkFaint}}>{kpi.label}</span>
              <span style={{fontSize:16,color:kpi.hi?t.accent:t.goldDim,lineHeight:1}}>{kpi.icon}</span>
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:6}}>
              <span style={{fontSize:32,fontWeight:400,fontFamily:"var(--serif)",color:kpi.hi?t.accent:t.ink,lineHeight:1}}>{kpi.val}</span>
              <span className="mono" style={{fontSize:10,color:t.inkFaint}}>{kpi.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Urgenti + Shopping preview */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {/* Scadenze urgenti */}
        <Card t={t}>
          <CardHeader t={t} title="Scadenze urgenti"
            right={<Badge label={`${urgent.length+expired.length}`} color={t.danger} bg={t.accentGlow}/>}/>
          <div style={{padding:"8px 0"}}>
            {[...expired,...urgent].length===0 ? (
              <div style={{padding:"20px 22px",color:t.inkFaint,fontSize:12,fontFamily:"var(--serif)",fontStyle:"italic"}}>✓ Nessun articolo in scadenza</div>
            ) : [...expired,...urgent].slice(0,6).map((item,i)=>{
              const badge = expiryBadge(item.expiresAt);
              return (
                <div key={item.id} style={{padding:"11px 22px",display:"flex",alignItems:"center",gap:12,borderBottom:i<5?`1px solid ${t.div}`:"none"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontFamily:"var(--serif)",color:t.ink,fontWeight:500}}>{item.name}</div>
                    <div className="mono" style={{fontSize:9,color:t.inkFaint}}>{item.location} · {item.quantity} {item.unit}</div>
                  </div>
                  {badge&&<Badge label={badge.label} color={badge.color} bg={badge.bg}/>}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Sotto par */}
        <Card t={t}>
          <CardHeader t={t} title="Sotto livello PAR"
            right={<Badge label={`${lowItems.length}`} color={t.warning} bg={t.goldFaint}/>}/>
          <div style={{padding:"8px 0"}}>
            {lowItems.length===0 ? (
              <div style={{padding:"20px 22px",color:t.inkFaint,fontSize:12,fontFamily:"var(--serif)",fontStyle:"italic"}}>✓ Tutti i livelli nella norma</div>
            ) : lowItems.slice(0,6).map((item,i)=>{
              const par = item.parLevel ?? PAR_PRESET[item.category] ?? 0;
              return (
                <div key={item.id} style={{padding:"11px 22px",display:"flex",alignItems:"center",gap:12,borderBottom:i<5?`1px solid ${t.div}`:"none"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontFamily:"var(--serif)",color:t.ink,fontWeight:500}}>{item.name}</div>
                    <div className="mono" style={{fontSize:9,color:t.inkFaint}}>{item.quantity}/{par} {item.unit}</div>
                  </div>
                  <BarMini value={item.quantity} max={par||1} t={t}/>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Shopping list preview */}
      {(kitchen.shopping||[]).length>0 && (
        <Card t={t}>
          <CardHeader t={t} title="Lista della spesa"
            right={<Badge label={`${kitchen.shopping.filter(x=>!x.checked).length} da fare`} color={t.secondary} bg={t.goldFaint}/>}/>
          <div style={{padding:"12px 22px",display:"flex",flexWrap:"wrap",gap:8}}>
            {kitchen.shopping.filter(x=>!x.checked).slice(0,12).map(x=>(
              <Badge key={x.id} label={`${x.name} ×${x.quantity}${x.unit}`} color={t.inkSoft} bg={t.bgAlt}/>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   INVENTORY VIEW
   ════════════════════════════════════════════════════════ */
function InventoryView({ t }) {
  const { kitchen, stockAdd, adjustItem, removeItem, setItemPar, currentRole } = useK();
  const toast = useToast();
  const canEdit = CAN_EDIT.includes(currentRole());

  const [loc,    setLoc]    = useState("fridge");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [fName,     setFName]     = useState("");
  const [fQty,      setFQty]      = useState("1");
  const [fUnit,     setFUnit]     = useState("pz");
  const [fCat,      setFCat]      = useState("proteine");
  const [fLot,      setFLot]      = useState("");
  const [fExpiry,   setFExpiry]   = useState("");
  const [fNotes,    setFNotes]    = useState("");

  const speech = useSpeech(t=>setFName(t));

  const LOCS = [
    {key:"fridge",   label:"Frigo",       icon:"❄️", temp:"2-4°C"},
    {key:"freezer",  label:"Congelatore", icon:"🧊", temp:"-18°C"},
    {key:"dry",      label:"Dispensa",    icon:"🏺", temp:"Ambiente"},
    {key:"counter",  label:"Banco",       icon:"🍽️", temp:"Servizio"},
  ];

  const items = ((kitchen||{})[loc]||[]).filter(item=>{
    if(!search) return true;
    return item.name.toLowerCase().includes(search.toLowerCase()) || (item.lot||"").toLowerCase().includes(search.toLowerCase());
  });

  function submitStock() {
    const qty=parseFloat(fQty);
    if(!fName.trim()||!isFinite(qty)||qty<=0) { toast("Compila nome e quantità","error"); return; }
    stockAdd({
      name:fName,quantity:qty,unit:fUnit,location:loc,category:fCat,
      lot:fLot||undefined,expiresAt:fExpiry?new Date(fExpiry).toISOString():undefined,
      notes:fNotes||undefined,insertedDate:todayDate(),
    });
    toast(`${fName} aggiunto/a`,"success");
    setFName(""); setFQty("1"); setFLot(""); setFExpiry(""); setFNotes("");
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Location tabs */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {LOCS.map(l=>(
          <button key={l.key} onClick={()=>setLoc(l.key)} style={{
            padding:"10px 20px",borderRadius:12,border:"none",cursor:"pointer",
            display:"flex",alignItems:"center",gap:8,fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.08em",
            background:loc===l.key?`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`:t.bgCard,
            color:loc===l.key?"#fff":t.inkMuted,
            boxShadow:loc===l.key?`0 4px 20px ${t.shadow}`:`0 1px 4px ${t.shadow}`,
            border:loc===l.key?"none":`1px solid ${t.div}`,
            transform:loc===l.key?"scale(1.02)":"scale(1)",transition:"all 0.3s",
          }}>
            <span style={{fontSize:16}}>{l.icon}</span>{l.label}
            <span style={{fontSize:8,opacity:0.7}}>{l.temp}</span>
            <span style={{background:loc===l.key?"rgba(255,255,255,0.2)":t.div,padding:"2px 8px",borderRadius:10,fontSize:9}}>
              {(kitchen?.[loc]||[]).length}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div style={{display:"flex",gap:10}}>
        <LuxInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca per nome o lotto…" t={t} style={{flex:1}}/>
        {canEdit&&<Btn t={t} variant={showForm?"ghost":"primary"} onClick={()=>setShowForm(!showForm)}>
          {showForm?"✕ Chiudi":"+ Aggiungi"}
        </Btn>}
      </div>

      {/* Add form */}
      {showForm&&canEdit&&(
        <Card t={t} style={{padding:20}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div style={{display:"flex",gap:8}}>
              <LuxInput value={fName} onChange={e=>setFName(e.target.value)} placeholder="Nome prodotto" t={t} style={{flex:1}}/>
              <VoiceBtn t={t} onResult={r=>setFName(r)}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <LuxInput value={fQty} onChange={e=>setFQty(e.target.value)} type="number" placeholder="Qtà" t={t}/>
              <LuxSelect value={fUnit} onChange={e=>setFUnit(e.target.value)} t={t}>
                {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </LuxSelect>
            </div>
            <LuxSelect value={fCat} onChange={e=>setFCat(e.target.value)} t={t}>
              {Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </LuxSelect>
            <LuxInput value={fLot} onChange={e=>setFLot(e.target.value)} placeholder="Lotto (HACCP)" t={t}/>
            <LuxInput value={fExpiry} onChange={e=>setFExpiry(e.target.value)} type="date" t={t}/>
            <LuxInput value={fNotes} onChange={e=>setFNotes(e.target.value)} placeholder="Note" t={t}/>
          </div>
          <Btn t={t} variant="gold" onClick={submitStock} disabled={!fName.trim()}>Carica in {LOCS.find(l=>l.key===loc)?.label}</Btn>
        </Card>
      )}

      {/* Items grid */}
      {items.length===0 ? (
        <div style={{textAlign:"center",padding:"48px 0",color:t.inkFaint}}>
          <div style={{fontFamily:"var(--serif)",fontSize:20,fontStyle:"italic",marginBottom:8}}>Nessun articolo</div>
          <div className="mono" style={{fontSize:9,letterSpacing:"0.14em"}}>
            {search?"NESSUN RISULTATO PER LA RICERCA":"SEZIONE VUOTA — AGGIUNGI PRODOTTI"}
          </div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
          {items.map((item,idx)=>{
            const badge  = expiryBadge(item.expiresAt);
            const par    = item.parLevel ?? PAR_PRESET[item.category] ?? 0;
            const isLow  = par>0 && item.quantity<par;
            const [sm,lg] = stepFor(item.unit);
            return (
              <div key={item.id} style={{
                background:t.bgCard,borderRadius:12,overflow:"hidden",
                border:`1px solid ${badge&&badge.bg==="#8B1E2F"?t.accent+"40":t.div}`,
                boxShadow:badge?`0 4px 20px ${t.accentGlow}`:`0 1px 6px ${t.shadow}`,
                animation:`cardIn 0.4s cubic-bezier(0.4,0,0.2,1) ${idx*0.04}s both`,
                transition:"all 0.3s",
              }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                {/* time progress bar at top */}
                {item.expiresAt&&(()=>{
                  const h=hoursUntil(item.expiresAt);
                  const maxH=72;
                  const pct = h===null?100:Math.min(Math.max((1-h/maxH)*100,0),100);
                  const barColor = !h||h<=0?t.danger:h<=24?t.danger:h<=72?t.warning:t.success;
                  return <div style={{height:3,background:t.bgAlt}}><div style={{height:"100%",width:`${pct}%`,background:barColor,transition:"width 1s"}}/></div>;
                })()}

                <div style={{padding:"16px 20px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:500,fontFamily:"var(--serif)",color:t.ink,marginBottom:3,fontStyle:"italic"}}>{item.name}</div>
                      <div className="mono" style={{fontSize:9,color:t.inkFaint}}>
                        {CATEGORIES[item.category]||item.category||"—"}
                        {item.lot&&` · ${item.lot}`}
                        {item.expiresAt&&` · Scad. ${fmtDate(item.expiresAt)}`}
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                      <span style={{fontSize:24,fontWeight:300,fontFamily:"var(--serif)",color:isLow?t.danger:t.ink,lineHeight:1}}>{item.quantity}</span>
                      <span className="mono" style={{fontSize:9,color:t.inkFaint,display:"block"}}>{item.unit}</span>
                    </div>
                  </div>

                  {par>0&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <BarMini value={item.quantity} max={par} t={t}/>
                    <span className="mono" style={{fontSize:8,color:t.inkFaint,minWidth:48,textAlign:"right"}}>par {par}</span>
                  </div>}

                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                    {badge&&<Badge label={badge.label} color={badge.color} bg={badge.bg}/>}
                    {isLow&&<Badge label="↓ SCORTA" color={t.warning} bg={t.goldFaint}/>}
                  </div>

                  {canEdit&&(
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <button onClick={()=>adjustItem(item.id,-sm)} style={btnSmall(t)}>−{sm}</button>
                      <button onClick={()=>adjustItem(item.id,-lg)} style={btnSmall(t)}>−{lg}</button>
                      <button onClick={()=>adjustItem(item.id,+sm)} style={{...btnSmall(t),background:t.success+"20",color:t.success}}>+{sm}</button>
                      <button onClick={()=>adjustItem(item.id,+lg)} style={{...btnSmall(t),background:t.success+"20",color:t.success}}>+{lg}</button>
                      <div style={{flex:1}}/>
                      <button onClick={()=>{ const p=prompt("Set par level:",item.parLevel||""); if(p!==null)setItemPar(item.id,p===""?null:Number(p)); }} style={{...btnSmall(t),fontSize:8}}>PAR</button>
                      <button onClick={()=>{ if(confirm(`Rimuovi ${item.name}?`))removeItem(item.id); }} style={{...btnSmall(t),background:t.accentGlow,color:t.danger}}>✕</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function btnSmall(t) {
  return {
    padding:"4px 10px",borderRadius:6,border:`1px solid ${t.div}`,cursor:"pointer",
    fontSize:10,fontFamily:"var(--mono)",background:t.bgAlt,color:t.inkMuted,
    transition:"all 0.15s",
  };
}

/* ════════════════════════════════════════════════════════
   STATIONS — partite di cucina
   ════════════════════════════════════════════════════════ */
const STATIONS = [
  {key:"saucier",    label:"Saucier",       icon:"🫕", color:"#8B1E2F"},
  {key:"poissonnier",label:"Poissonnier",   icon:"🐟", color:"#2A4FA5"},
  {key:"rotisseur",  label:"Rôtisseur",     icon:"🥩", color:"#8B4A1E"},
  {key:"garde",      label:"Garde Manger",  icon:"🥗", color:"#3D7A4A"},
  {key:"patissier",  label:"Pâtissier",     icon:"🍮", color:"#7A5A1E"},
  {key:"communard",  label:"Communard",     icon:"🍲", color:"#555"},
  {key:"all",        label:"Tutta la brigata", icon:"⭐", color:"#C19A3E"},
];

/* ════════════════════════════════════════════════════════
   MEP VIEW — AI-powered: foto / file / voce → tasks per partita
   ════════════════════════════════════════════════════════ */
function MepView({ t }) {
  const { kitchen, stockAdd, currentRole } = useK();
  const toast = useToast();
  const canEdit = CAN_EDIT.includes(currentRole());
  const kid = kitchen?.id;

  // ── Persistent task list ──────────────────────────────
  const STORAGE = `mep-tasks-${kid}`;
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE) || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(tasks)); }, [tasks, STORAGE]);

  // ── Filters ───────────────────────────────────────────
  const [filterStation, setFilterStation] = useState("all");
  const [filterDone,    setFilterDone]    = useState(false);

  // ── Manual add ────────────────────────────────────────
  const [manualText,    setManualText]    = useState("");
  const [manualStation, setManualStation] = useState("saucier");
  const speech = useSpeech(r => setManualText(r));

  // ── Load-in modal ─────────────────────────────────────
  const [moveModal, setMoveModal] = useState(null);
  const [moveQty,   setMoveQty]   = useState("1");
  const [moveDest,  setMoveDest]  = useState("fridge");

  // ── AI import panel ───────────────────────────────────
  const [showAIImport,  setShowAIImport]  = useState(false);
  const [aiMode,        setAiMode]        = useState("voice"); // voice | file | text
  const [aiText,        setAiText]        = useState("");
  const [aiFile,        setAiFile]        = useState(null);   // {name, base64, mimeType}
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiPreview,     setAiPreview]     = useState(null);   // [{station, text}] after parse
  const [aiPreviewSel,  setAiPreviewSel]  = useState({});     // id → bool for selection
  const fileInputRef = useRef(null);
  const voiceSpeech  = useSpeech(r => setAiText(prev => (prev ? prev + " " + r : r)));

  // ── Task helpers ──────────────────────────────────────
  function addTask(text, station) {
    const tx = text.trim(); if (!tx) return;
    setTasks(p => [...p, { id:genId(), text:tx, station:station||"all", done:false, createdAt:nowISO() }]);
  }
  function toggleTask(id) { setTasks(p => p.map(x => x.id !== id ? x : {...x, done:!x.done})); }
  function removeTask(id) { setTasks(p => p.filter(x => x.id !== id)); }

  function doManualAdd() {
    if (!manualText.trim()) { toast("Scrivi la preparazione","error"); return; }
    addTask(manualText, manualStation);
    toast(`Aggiunto a ${STATIONS.find(s=>s.key===manualStation)?.label}`,"success");
    setManualText("");
  }

  function doLoadIn() {
    if (!moveModal) return;
    const qty = parseFloat(moveQty);
    if (!isFinite(qty) || qty <= 0) { toast("Inserisci quantità valida","error"); return; }
    stockAdd({ name:moveModal.text, quantity:qty, unit:"pz", location:moveDest, lot:`MEP-${todayDate()}` });
    setTasks(p => p.map(x => x.id !== moveModal.id ? x : {...x, done:true}));
    setMoveModal(null);
    toast(`${moveModal.text} → ${moveDest}`,"success");
  }

  // ── File → base64 ─────────────────────────────────────
  function handleFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","application/pdf","text/plain","text/csv"];
    if (!allowed.includes(file.type)) { toast("Formato non supportato. Usa: foto, PDF, testo","error"); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target.result.split(",")[1];
      setAiFile({ name:file.name, base64:b64, mimeType:file.type });
      toast(`File caricato: ${file.name}`,"success");
    };
    reader.readAsDataURL(file);
  }

  // ── AI parse ──────────────────────────────────────────
  async function runAI() {
    const hasInput = (aiMode==="file" && aiFile) || (aiMode!=="file" && aiText.trim());
    if (!hasInput) { toast("Inserisci contenuto da analizzare","error"); return; }

    setAiLoading(true);
    setAiPreview(null);

    const brigataContext = (kitchen?.members||[])
      .map(m => `${m.name} (${m.role})`).join(", ");

    const systemPrompt = `Sei un assistente per cucine professionali Michelin. Il tuo compito è analizzare documenti (ricette, piani di produzione, foglietti interni, menu, appunti scritti a mano) ed estrarre le preparazioni MEP (mise en place) per ogni partita.

Brigata attuale: ${brigataContext || "non specificata"}.
Partite disponibili: ${STATIONS.filter(s=>s.key!=="all").map(s=>s.label).join(", ")}.

Rispondi SOLO con un JSON array, senza markdown, senza testo extra. Formato:
[
  {"station": "saucier", "tasks": ["Fondo bruno ridotto", "Salsa Périgueux"]},
  {"station": "poissonnier", "tasks": ["Sfilettare rombo", "Pulire vongole"]},
  ...
]

Usa i valori di station: saucier, poissonnier, rotisseur, garde, patissier, communard.
Se non riesci ad assegnare una stazione, usa "all".
Se non trovi preparazioni, rispondi [].
Non inventare nulla che non sia nel documento.`;

    try {
      let userContent;

      if (aiMode === "file" && aiFile) {
        if (aiFile.mimeType.startsWith("image/")) {
          userContent = [
            { type:"image", source:{ type:"base64", media_type:aiFile.mimeType, data:aiFile.base64 } },
            { type:"text",  text:"Analizza questa immagine ed estrai le preparazioni MEP per partita." },
          ];
        } else if (aiFile.mimeType === "application/pdf") {
          userContent = [
            { type:"document", source:{ type:"base64", media_type:"application/pdf", data:aiFile.base64 } },
            { type:"text", text:"Analizza questo documento ed estrai le preparazioni MEP per partita." },
          ];
        } else {
          // plain text file
          const decoded = atob(aiFile.base64);
          userContent = `Analizza questo documento ed estrai le preparazioni MEP per partita:\n\n${decoded}`;
        }
      } else {
        userContent = `Analizza questo testo ed estrai le preparazioni MEP per partita:\n\n${aiText.trim()}`;
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system: systemPrompt,
          messages:[{ role:"user", content:userContent }],
        }),
      });
      const data = await res.json();
      const raw  = (data.content||[]).map(b=>b.text||"").join("").trim();

      let parsed;
      try {
        const clean = raw.replace(/```json|```/g,"").trim();
        parsed = JSON.parse(clean);
      } catch {
        toast("Risposta AI non valida. Riprova.","error");
        setAiLoading(false); return;
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        toast("Nessuna preparazione trovata nel documento","error");
        setAiLoading(false); return;
      }

      // Flatten to preview items with selection state
      const items = [];
      parsed.forEach(group => {
        const stationKey = STATIONS.find(s=>s.key===group.station||s.label.toLowerCase()===group.station?.toLowerCase())?.key || "all";
        (group.tasks||[]).forEach(taskText => {
          if (typeof taskText==="string" && taskText.trim()) {
            items.push({ id:genId(), station:stationKey, text:taskText.trim() });
          }
        });
      });

      if (items.length===0) { toast("Nessuna preparazione estratta","error"); setAiLoading(false); return; }

      setAiPreview(items);
      // select all by default
      const sel = {};
      items.forEach(x => { sel[x.id]=true; });
      setAiPreviewSel(sel);
      toast(`${items.length} preparazioni trovate — conferma prima di inserire`,"success");

    } catch(err) {
      toast("Errore API: " + (err.message||"rete"), "error");
    }
    setAiLoading(false);
  }

  function confirmInsert() {
    const toInsert = (aiPreview||[]).filter(x=>aiPreviewSel[x.id]);
    if (!toInsert.length) { toast("Nessuna selezione","error"); return; }
    toInsert.forEach(x => addTask(x.text, x.station));
    toast(`${toInsert.length} preparazioni inserite in lista`,"success");
    setAiPreview(null);
    setAiPreviewSel({});
    setAiText("");
    setAiFile(null);
    setShowAIImport(false);
  }

  // ── Filtered task list ────────────────────────────────
  const visibleTasks = tasks.filter(x => {
    if (!filterDone && x.done) return false;
    if (filterStation !== "all" && x.station !== filterStation) return false;
    return true;
  });
  const todo = visibleTasks.filter(x=>!x.done);
  const done = visibleTasks.filter(x=>x.done);

  // ── Station group counts for badge ────────────────────
  const countByStation = {};
  STATIONS.forEach(s => { countByStation[s.key] = tasks.filter(x=>!x.done&&(s.key==="all"||x.station===s.key)).length; });

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>

      {/* ── AI IMPORT PANEL ─────────────────────────────── */}
      {showAIImport && (
        <Card t={t} glow style={{padding:0,overflow:"visible"}}>
          {/* Panel header */}
          <div style={{
            padding:"16px 22px",
            background:`linear-gradient(135deg, ${t.secondary}, ${t.secondaryDeep})`,
            display:"flex",alignItems:"center",justifyContent:"space-between",
            borderRadius:"14px 14px 0 0",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>🤖</span>
              <div>
                <div style={{color:"#fff",fontFamily:"var(--serif)",fontSize:15,fontWeight:500}}>Importa preparazioni con AI</div>
                <div className="mono" style={{fontSize:7,color:"rgba(255,255,255,0.45)",letterSpacing:"0.16em",marginTop:1}}>
                  FOTO · FILE · TESTO · VOCE → LISTA MEP
                </div>
              </div>
            </div>
            <button onClick={()=>{setShowAIImport(false);setAiPreview(null);}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.5)",fontSize:20,cursor:"pointer",lineHeight:1}}>✕</button>
          </div>

          <div style={{padding:22,display:"flex",flexDirection:"column",gap:18}}>
            {/* Mode selector */}
            <div style={{display:"flex",gap:8}}>
              {[
                {key:"voice", label:"🎤 Voce / Testo", desc:"Ditta o scrivi"},
                {key:"file",  label:"📄 Foto / File",  desc:"Immagine, PDF, .txt"},
              ].map(m=>(
                <button key={m.key} onClick={()=>{setAiMode(m.key);setAiPreview(null);}} style={{
                  flex:1,padding:"12px 16px",borderRadius:10,border:"none",cursor:"pointer",
                  background:aiMode===m.key?`linear-gradient(135deg,${t.gold},${t.goldBright})`:t.bgAlt,
                  color:aiMode===m.key?"#fff":t.inkMuted,
                  fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.06em",
                  boxShadow:aiMode===m.key?`0 4px 16px ${t.goldFaint}`:`0 1px 4px ${t.shadow}`,
                  transition:"all 0.25s",
                  border:aiMode===m.key?"none":`1px solid ${t.div}`,
                }}>
                  <div style={{fontSize:14,marginBottom:4}}>{m.label}</div>
                  <div style={{fontSize:8,opacity:0.7}}>{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Voice / text mode */}
            {aiMode==="voice" && !aiPreview && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{fontSize:11,fontFamily:"var(--serif)",fontStyle:"italic",color:t.inkMuted}}>
                  Ditta le preparazioni, oppure incolla il testo del foglio cucina. L'AI le assegnerà alle partite.
                </div>
                <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <textarea
                    value={aiText}
                    onChange={e=>setAiText(e.target.value)}
                    placeholder={"Es: Saucier — fondo bruno ridotto, salsa Périgueux.\nPoissonnier — sfilettare 8 rombi, aprire 2kg vongole.\nPâtissier — crema pasticcera x40, mignardises."}
                    style={{
                      flex:1,minHeight:120,padding:"12px 14px",borderRadius:10,
                      fontSize:12,fontFamily:"var(--serif)",fontStyle:"italic",
                      background:t.bgCardAlt,color:t.ink,border:`1px solid ${t.div}`,
                      outline:"none",resize:"vertical",lineHeight:1.6,
                    }}
                    onFocus={e=>e.target.style.borderColor=t.gold}
                    onBlur={e=>e.target.style.borderColor=t.div}
                  />
                  <VoiceBtn t={t} onResult={r=>setAiText(p=>p?(p+" "+r):r)}/>
                </div>
              </div>
            )}

            {/* File mode */}
            {aiMode==="file" && !aiPreview && (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{fontSize:11,fontFamily:"var(--serif)",fontStyle:"italic",color:t.inkMuted}}>
                  Carica la foto del foglio MEP, un PDF stampato, o un file di testo. Funziona anche con scrittura a mano.
                </div>
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,text/plain" style={{display:"none"}} onChange={handleFile}/>
                <div
                  onClick={()=>fileInputRef.current?.click()}
                  style={{
                    border:`2px dashed ${aiFile?t.gold:t.div}`,borderRadius:12,
                    padding:"28px 22px",textAlign:"center",cursor:"pointer",
                    background:aiFile?t.goldFaint:t.bgAlt,transition:"all 0.25s",
                  }}
                  onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=t.gold;}}
                  onDragLeave={e=>{e.currentTarget.style.borderColor=aiFile?t.gold:t.div;}}
                  onDrop={e=>{
                    e.preventDefault();
                    const f=e.dataTransfer.files?.[0];
                    if(f){ const fakeEv={target:{files:[f]}}; handleFile(fakeEv); }
                  }}
                >
                  {aiFile ? (
                    <div>
                      <div style={{fontSize:28,marginBottom:6}}>✓</div>
                      <div style={{fontFamily:"var(--serif)",fontSize:14,color:t.gold,fontStyle:"italic"}}>{aiFile.name}</div>
                      <div className="mono" style={{fontSize:9,color:t.inkFaint,marginTop:4}}>Clicca per sostituire</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{fontSize:32,marginBottom:8}}>📸</div>
                      <div style={{fontFamily:"var(--serif)",fontSize:13,fontStyle:"italic",color:t.inkMuted}}>Trascina qui o clicca per scegliere</div>
                      <div className="mono" style={{fontSize:9,color:t.inkFaint,marginTop:4}}>JPG · PNG · WEBP · PDF · TXT</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preview extracted tasks */}
            {aiPreview && (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontFamily:"var(--serif)",fontSize:13,fontStyle:"italic",color:t.ink}}>
                    {aiPreview.length} preparazioni estratte — seleziona quelle da inserire:
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{const s={};aiPreview.forEach(x=>{s[x.id]=true;});setAiPreviewSel(s);}} style={{...btnSmall(t),fontSize:8}}>Tutto</button>
                    <button onClick={()=>setAiPreviewSel({})} style={{...btnSmall(t),fontSize:8}}>Niente</button>
                  </div>
                </div>

                {/* Group by station */}
                {STATIONS.filter(s=>s.key!=="all").map(station=>{
                  const stTasks = aiPreview.filter(x=>x.station===station.key);
                  if (!stTasks.length) return null;
                  return (
                    <div key={station.key} style={{borderRadius:10,overflow:"hidden",border:`1px solid ${t.div}`}}>
                      <div style={{
                        padding:"9px 14px",display:"flex",alignItems:"center",gap:10,
                        background:`linear-gradient(135deg, ${station.color}22, ${station.color}11)`,
                        borderBottom:`1px solid ${t.div}`,
                      }}>
                        <span style={{fontSize:14}}>{station.icon}</span>
                        <span className="mono" style={{fontSize:9,letterSpacing:"0.1em",color:station.color,fontWeight:600}}>{station.label.toUpperCase()}</span>
                        <span style={{marginLeft:"auto",fontSize:9,fontFamily:"var(--mono)",color:t.inkFaint}}>{stTasks.filter(x=>aiPreviewSel[x.id]).length}/{stTasks.length} selezionate</span>
                      </div>
                      {stTasks.map((item,i)=>(
                        <div key={item.id} style={{
                          padding:"10px 14px",display:"flex",alignItems:"center",gap:12,
                          borderBottom:i<stTasks.length-1?`1px solid ${t.div}`:"none",
                          background:aiPreviewSel[item.id]?t.bgAlt:t.bgCard,
                          cursor:"pointer",transition:"background 0.15s",
                        }}
                        onClick={()=>setAiPreviewSel(p=>({...p,[item.id]:!p[item.id]}))}>
                          <div style={{
                            width:18,height:18,borderRadius:4,border:`1.5px solid ${aiPreviewSel[item.id]?t.gold:t.div}`,
                            background:aiPreviewSel[item.id]?t.gold:"transparent",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            flexShrink:0,transition:"all 0.15s",
                          }}>
                            {aiPreviewSel[item.id]&&<span style={{color:"#fff",fontSize:10,lineHeight:1}}>✓</span>}
                          </div>
                          <span style={{fontFamily:"var(--serif)",fontSize:13,fontStyle:"italic",color:t.ink,flex:1}}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}

                {/* Also show "all" items */}
                {aiPreview.filter(x=>x.station==="all").length>0&&(
                  <div style={{borderRadius:10,overflow:"hidden",border:`1px solid ${t.div}`}}>
                    <div style={{padding:"9px 14px",background:t.bgAlt,borderBottom:`1px solid ${t.div}`}}>
                      <span className="mono" style={{fontSize:9,letterSpacing:"0.1em",color:t.inkMuted}}>STAZIONE NON SPECIFICATA</span>
                    </div>
                    {aiPreview.filter(x=>x.station==="all").map((item,i,arr)=>(
                      <div key={item.id} style={{
                        padding:"10px 14px",display:"flex",alignItems:"center",gap:12,
                        borderBottom:i<arr.length-1?`1px solid ${t.div}`:"none",
                        background:aiPreviewSel[item.id]?t.bgAlt:t.bgCard,cursor:"pointer",transition:"background 0.15s",
                      }}
                      onClick={()=>setAiPreviewSel(p=>({...p,[item.id]:!p[item.id]}))}>
                        <div style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${aiPreviewSel[item.id]?t.gold:t.div}`,background:aiPreviewSel[item.id]?t.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                          {aiPreviewSel[item.id]&&<span style={{color:"#fff",fontSize:10}}>✓</span>}
                        </div>
                        <span style={{fontFamily:"var(--serif)",fontSize:13,fontStyle:"italic",color:t.ink,flex:1}}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{display:"flex",gap:10}}>
                  <Btn t={t} variant="gold" onClick={confirmInsert} disabled={!Object.values(aiPreviewSel).some(Boolean)}>
                    ✓ Inserisci {Object.values(aiPreviewSel).filter(Boolean).length} preparazioni in lista
                  </Btn>
                  <Btn t={t} variant="ghost" onClick={()=>{setAiPreview(null);setAiPreviewSel({});}}>← Rianalizza</Btn>
                </div>
              </div>
            )}

            {/* Analyze button */}
            {!aiPreview && (
              <Btn t={t} variant="primary"
                onClick={runAI}
                disabled={aiLoading || (aiMode==="file"?!aiFile:!aiText.trim())}
                style={{alignSelf:"flex-start"}}
              >
                {aiLoading
                  ? <span style={{display:"flex",alignItems:"center",gap:8}}><span style={{animation:"blink 1s ease-in-out infinite"}}>◷</span> Analisi in corso…</span>
                  : "🤖 Analizza ed estrai preparazioni"}
              </Btn>
            )}
          </div>
        </Card>
      )}

      {/* ── MANUAL ADD + AI BUTTON ───────────────────────── */}
      {canEdit && !showAIImport && (
        <Card t={t} style={{padding:20}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <LuxInput value={manualText} onChange={e=>setManualText(e.target.value)} placeholder="Preparazione manuale (es: Brunoise scalogno)" t={t} style={{flex:"1 1 200px"}}
              onKeyDown={e=>e.key==="Enter"&&doManualAdd()}/>
            <LuxSelect value={manualStation} onChange={e=>setManualStation(e.target.value)} t={t} style={{width:160}}>
              {STATIONS.filter(s=>s.key!=="all").map(s=><option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
            </LuxSelect>
            <VoiceBtn t={t} onResult={r=>setManualText(r)}/>
            <Btn t={t} onClick={doManualAdd} disabled={!manualText.trim()}>+ Aggiungi</Btn>
            <button onClick={()=>setShowAIImport(true)} style={{
              padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",
              background:`linear-gradient(135deg, ${t.gold}, ${t.goldBright})`,
              color:"#fff",fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.08em",
              boxShadow:`0 3px 14px ${t.goldFaint}`,display:"flex",alignItems:"center",gap:8,
            }}>
              <span>🤖</span> Importa da foto / file / voce
            </button>
          </div>
        </Card>
      )}
      {canEdit && showAIImport && !aiPreview && (
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <Btn t={t} variant="ghost" onClick={()=>setShowAIImport(false)}>← Torna alla lista</Btn>
        </div>
      )}

      {/* ── STATION FILTER TABS ──────────────────────────── */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {STATIONS.map(s=>{
          const cnt = countByStation[s.key];
          const active = filterStation===s.key;
          return (
            <button key={s.key} onClick={()=>setFilterStation(s.key)} style={{
              padding:"8px 16px",borderRadius:10,border:"none",cursor:"pointer",
              fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.06em",
              background:active?`linear-gradient(135deg,${s.color},${s.color}CC)`:t.bgCard,
              color:active?"#fff":t.inkMuted,
              border:active?"none":`1px solid ${t.div}`,
              display:"flex",alignItems:"center",gap:6,transition:"all 0.25s",
              boxShadow:active?`0 4px 16px ${s.color}30`:`0 1px 4px ${t.shadow}`,
            }}>
              <span style={{fontSize:12}}>{s.icon}</span>
              {s.label}
              {cnt>0&&<span style={{background:active?"rgba(255,255,255,0.25)":s.color+"25",color:active?"#fff":s.color,padding:"1px 7px",borderRadius:8,fontSize:8}}>{cnt}</span>}
            </button>
          );
        })}
        <button onClick={()=>setFilterDone(!filterDone)} style={{
          padding:"8px 14px",borderRadius:10,border:`1px solid ${t.div}`,cursor:"pointer",
          fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.06em",
          background:filterDone?t.bgAlt:t.bgCard,color:t.inkMuted,marginLeft:"auto",
        }}>
          {filterDone?"Nascondi completate":"Mostra completate"}
        </button>
      </div>

      {/* ── TASK COLUMNS ─────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Da fare */}
        <Card t={t}>
          <CardHeader t={t} title={`Da fare (${todo.length})`}/>
          <div>
            {todo.length===0 && (
              <div style={{padding:"24px 22px",color:t.inkFaint,fontSize:12,fontFamily:"var(--serif)",fontStyle:"italic",textAlign:"center"}}>
                ✓ Tutto completato
              </div>
            )}
            {todo.map((task,i)=>{
              const station = STATIONS.find(s=>s.key===task.station)||STATIONS[STATIONS.length-1];
              return (
                <div key={task.id} style={{
                  padding:"12px 22px",display:"flex",alignItems:"flex-start",gap:12,
                  borderBottom:i<todo.length-1?`1px solid ${t.div}`:"none",
                  borderLeft:`3px solid ${station.color}`,
                  transition:"background 0.15s",
                }}
                onMouseEnter={e=>e.currentTarget.style.background=t.bgAlt}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{fontSize:12,marginTop:2,flexShrink:0}}>{station.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontFamily:"var(--serif)",fontStyle:"italic",color:t.ink,lineHeight:1.4}}>{task.text}</div>
                    <div className="mono" style={{fontSize:8,color:station.color,marginTop:3,opacity:0.8}}>{station.label}</div>
                  </div>
                  {canEdit&&(
                    <div style={{display:"flex",gap:5,flexShrink:0}}>
                      <button onClick={()=>setMoveModal(task)} style={{...btnSmall(t),background:t.success+"20",color:t.success,fontSize:8,padding:"3px 8px"}}>↑ Carica</button>
                      <button onClick={()=>toggleTask(task.id)} style={{...btnSmall(t),fontSize:8,padding:"3px 8px"}}>✓</button>
                      <button onClick={()=>removeTask(task.id)} style={{...btnSmall(t),background:t.accentGlow,color:t.danger,fontSize:8,padding:"3px 8px"}}>✕</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Completate */}
        <Card t={t}>
          <CardHeader t={t} title={`Completate (${done.length})`}
            right={done.length>0&&canEdit?(
              <button onClick={()=>setTasks(p=>p.filter(x=>!x.done))} style={{...btnSmall(t),fontSize:8}}>Pulisci</button>
            ):null}/>
          <div>
            {done.length===0 && (
              <div style={{padding:"24px 22px",color:t.inkFaint,fontSize:12,fontFamily:"var(--serif)",fontStyle:"italic",textAlign:"center"}}>
                Nessuna completata
              </div>
            )}
            {done.map((task,i)=>{
              const station = STATIONS.find(s=>s.key===task.station)||STATIONS[STATIONS.length-1];
              return (
                <div key={task.id} style={{
                  padding:"12px 22px",display:"flex",alignItems:"center",gap:12,
                  borderBottom:i<done.length-1?`1px solid ${t.div}`:"none",
                  opacity:0.55, borderLeft:`3px solid ${station.color}44`,
                }}>
                  <span style={{fontSize:12,color:t.success}}>✓</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontFamily:"var(--serif)",fontStyle:"italic",color:t.inkMuted,textDecoration:"line-through"}}>{task.text}</div>
                    <div className="mono" style={{fontSize:8,color:station.color,marginTop:2,opacity:0.7}}>{station.label}</div>
                  </div>
                  {canEdit&&<button onClick={()=>toggleTask(task.id)} style={{...btnSmall(t),fontSize:8}}>Annulla</button>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── LOAD-IN MODAL ────────────────────────────────── */}
      {moveModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Card t={t} style={{width:380,padding:28}}>
            <div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:8}}>CARICA IN GIACENZA</div>
            <div style={{fontFamily:"var(--serif)",fontSize:17,fontStyle:"italic",color:t.ink,marginBottom:20,lineHeight:1.4}}>{moveModal.text}</div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <LuxInput value={moveQty} onChange={e=>setMoveQty(e.target.value)} type="number" placeholder="Quantità" t={t}/>
                <LuxSelect value={moveDest} onChange={e=>setMoveDest(e.target.value)} t={t}>
                  <option value="fridge">Frigo</option>
                  <option value="freezer">Congelatore</option>
                  <option value="dry">Dispensa</option>
                  <option value="counter">Banco</option>
                </LuxSelect>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn t={t} variant="gold" onClick={doLoadIn}>↑ Carica in giacenza</Btn>
                <Btn t={t} variant="ghost" onClick={()=>setMoveModal(null)}>Annulla</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SHOPPING VIEW
   ════════════════════════════════════════════════════════ */
function ShoppingView({ t }) {
  const { kitchen, shopAdd, shopToggle, shopRemove, shopClear, currentRole } = useK();
  const toast = useToast();
  const canEdit = CAN_EDIT.includes(currentRole());

  const [name, setName]  = useState("");
  const [qty,  setQty]   = useState("1");
  const [unit, setUnit]  = useState("pz");
  const [cat,  setCat]   = useState("economato");
  const [notes,setNotes] = useState("");
  const speech = useSpeech(t=>setName(t));

  const CATS = ["economato","giornaliero","settimanale","altro"];
  const items = (kitchen?.shopping||[]);

  function add() {
    if(!name.trim()||parseFloat(qty)<=0) { toast("Compila nome e quantità","error"); return; }
    shopAdd(name,parseFloat(qty),unit,cat,notes);
    toast(`${name} aggiunto alla lista`,"success");
    setName(""); setQty("1"); setNotes("");
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {canEdit&&(
        <Card t={t} style={{padding:20}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div style={{display:"flex",gap:8}}>
              <LuxInput value={name} onChange={e=>setName(e.target.value)} placeholder="Articolo" t={t} style={{flex:1}}/>
              <VoiceBtn t={t} onResult={r=>setName(r)}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <LuxInput value={qty} onChange={e=>setQty(e.target.value)} type="number" placeholder="Qtà" t={t}/>
              <LuxSelect value={unit} onChange={e=>setUnit(e.target.value)} t={t}>
                {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </LuxSelect>
            </div>
            <LuxSelect value={cat} onChange={e=>setCat(e.target.value)} t={t}>
              {CATS.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </LuxSelect>
            <LuxInput value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Note" t={t}/>
          </div>
          <Btn t={t} onClick={add} disabled={!name.trim()}>Aggiungi alla lista</Btn>
        </Card>
      )}

      {CATS.map(category=>{
        const catItems = items.filter(x=>x.category===category);
        if(!catItems.length) return null;
        const unchecked = catItems.filter(x=>!x.checked);
        const checked   = catItems.filter(x=>x.checked);
        return (
          <Card key={category} t={t}>
            <CardHeader t={t} title={category.toUpperCase()}
              right={canEdit&&checked.length>0?<button onClick={()=>shopClear(category)} style={{...btnSmall(t),fontSize:8}}>Pulisci spuntati</button>:null}/>
            <div>
              {[...unchecked,...checked].map((item,i)=>(
                <div key={item.id} style={{padding:"11px 22px",display:"flex",alignItems:"center",gap:12,borderBottom:i<catItems.length-1?`1px solid ${t.div}`:"none",opacity:item.checked?0.5:1,transition:"opacity 0.2s"}}>
                  <input type="checkbox" checked={item.checked} onChange={()=>shopToggle(item.id)} style={{cursor:"pointer",accentColor:t.gold}}/>
                  <div style={{flex:1}}>
                    <span style={{fontSize:13,fontFamily:"var(--serif)",color:t.ink,textDecoration:item.checked?"line-through":"none",fontStyle:"italic"}}>{item.name}</span>
                    <span className="mono" style={{fontSize:9,color:t.inkFaint,marginLeft:8}}>{item.quantity} {item.unit}</span>
                    {item.notes&&<span style={{fontSize:9,color:t.inkFaint,marginLeft:8,fontStyle:"italic"}}>· {item.notes}</span>}
                  </div>
                  {canEdit&&<button onClick={()=>shopRemove(item.id)} style={{...btnSmall(t),background:t.accentGlow,color:t.danger}}>✕</button>}
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {items.length===0&&(
        <div style={{textAlign:"center",padding:"48px 0",color:t.inkFaint}}>
          <div style={{fontFamily:"var(--serif)",fontSize:20,fontStyle:"italic",marginBottom:8}}>Lista vuota</div>
          <div className="mono" style={{fontSize:9,letterSpacing:"0.14em"}}>AGGIUNGI ARTICOLI DA ORDINARE</div>
        </div>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   SPESA VIEW v2 — vista tabellare tipologia × frequenza
   Economato | Alimenti | Altro  ×  Giornaliero | Settimanale
   ════════════════════════════════════════════════════════ */
function SpesaView({ t }) {
  const { kitchen, spesaV2Add, spesaV2Toggle, spesaV2Remove, spesaV2Clear, currentRole } = useK();
  const toast = useToast();
  const canEdit = CAN_EDIT.includes(currentRole());

  const items = kitchen?.spesaV2||[];
  const [tab, setTab]     = useState("tabella");
  const [form, setForm]   = useState({nome:"",qty:"1",unit:"pz",tipologia:"alimenti",frequenza:"giornaliero",note:""});
  const [aiLoading,setAiLoading] = useState(false);

  function save() {
    if(!form.nome.trim()) { toast("Inserisci il nome articolo","error"); return; }
    spesaV2Add(form.nome,form.qty,form.unit,form.tipologia,form.frequenza,form.note);
    toast(`${form.nome} aggiunto`,"success");
    setForm(p=>({...p,nome:"",qty:"1",note:""}));
  }

  // ── matrice per vista tabellare ──────────────────────────
  const matrice = useMemo(()=>
    SPESA_TIPOLOGIE.map(tip=>({
      tip,
      label: SPESA_TIP_LABELS[tip],
      icon:  SPESA_TIP_ICONS[tip],
      giornalieri: items.filter(i=>i.tipologia===tip&&i.frequenza==="giornaliero"),
      settimanali: items.filter(i=>i.tipologia===tip&&i.frequenza==="settimanale"),
    })).filter(r=>r.giornalieri.length||r.settimanali.length||true),
    [items]
  );
  const totale = items.filter(x=>!x.checked).length;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Tab header */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        {[{k:"tabella",l:`📊 Vista Tabella (${totale})`},{k:"aggiungi",l:"+ Aggiungi"}].map(({k,l})=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:"8px 16px",borderRadius:10,border:"none",cursor:"pointer",
            fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.06em",
            background:tab===k?`linear-gradient(135deg,${t.accent},${t.accentDeep})`:t.bgCard,
            color:tab===k?"#fff":t.inkMuted,boxShadow:`0 1px 4px ${t.shadow}`,transition:"all 0.2s",
          }}>{l}</button>
        ))}
        {items.some(x=>x.checked)&&(
          <button onClick={()=>{spesaV2Clear();toast("Spuntati rimossi","success");}} style={{
            marginLeft:"auto",padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",
            fontFamily:"var(--mono)",fontSize:9,background:t.accentGlow,color:t.danger,
          }}>Pulisci spuntati</button>
        )}
      </div>

      {/* Form aggiunta */}
      {(tab==="aggiungi"||!items.length)&&canEdit&&(
        <Card t={t} style={{padding:20}}>
          <div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:12}}>NUOVO ARTICOLO</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <LuxInput value={form.nome} onChange={e=>setForm(p=>({...p,nome:e.target.value}))}
              placeholder="Articolo" t={t} style={{gridColumn:"1/-1"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <LuxInput value={form.qty} onChange={e=>setForm(p=>({...p,qty:e.target.value}))} type="number" t={t} placeholder="Qtà"/>
              <LuxSelect value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} t={t}>
                {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </LuxSelect>
            </div>
            <LuxSelect value={form.tipologia} onChange={e=>setForm(p=>({...p,tipologia:e.target.value}))} t={t}>
              {SPESA_TIPOLOGIE.map(s=><option key={s} value={s}>{SPESA_TIP_ICONS[s]} {SPESA_TIP_LABELS[s]}</option>)}
            </LuxSelect>
            <LuxSelect value={form.frequenza} onChange={e=>setForm(p=>({...p,frequenza:e.target.value}))} t={t}>
              {SPESA_FREQUENZE.map(f=><option key={f} value={f}>{SPESA_FREQ_LABELS[f]}</option>)}
            </LuxSelect>
            <LuxInput value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} placeholder="Note" t={t} style={{gridColumn:"1/-1"}}/>
          </div>
          <Btn t={t} variant="gold" onClick={save} disabled={!form.nome.trim()}>+ Aggiungi alla Lista</Btn>
        </Card>
      )}

      {/* Vista tabellare */}
      {tab==="tabella"&&(
        <Card t={t} style={{padding:0,overflow:"hidden"}}>
          {/* Intestazione colonne */}
          <div style={{
            display:"grid",gridTemplateColumns:"160px 1fr 1fr",
            background:t.bgAlt,borderBottom:`1px solid ${t.div}`,
          }}>
            {["Categoria","Giornaliero","Settimanale"].map(h=>(
              <div key={h} style={{padding:"12px 16px",fontFamily:"var(--mono)",fontSize:9,
                letterSpacing:"0.12em",color:t.inkFaint,borderRight:`1px solid ${t.div}`}}>
                {h}
              </div>
            ))}
          </div>
          {/* Righe per tipologia */}
          {matrice.map(riga=>(
            <div key={riga.tip} style={{display:"grid",gridTemplateColumns:"160px 1fr 1fr",borderBottom:`1px solid ${t.div}`}}>
              {/* Label tipologia */}
              <div style={{padding:"14px 16px",display:"flex",alignItems:"flex-start",gap:8,
                borderRight:`1px solid ${t.div}`,background:t.bgAlt}}>
                <span style={{fontSize:18}}>{riga.icon}</span>
                <span style={{fontFamily:"var(--mono)",fontSize:10,color:t.ink,letterSpacing:"0.06em",marginTop:2}}>
                  {riga.label.toUpperCase()}
                </span>
              </div>
              {/* Colonna giornalieri */}
              <div style={{padding:"8px 12px",borderRight:`1px solid ${t.div}`}}>
                {riga.giornalieri.map(item=>(
                  <SpesaItemRow key={item.id} item={item} t={t} canEdit={canEdit}
                    onToggle={spesaV2Toggle} onRemove={spesaV2Remove}/>
                ))}
                {riga.giornalieri.length===0&&(
                  <div style={{padding:"8px 0",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:11}}>—</div>
                )}
              </div>
              {/* Colonna settimanali */}
              <div style={{padding:"8px 12px"}}>
                {riga.settimanali.map(item=>(
                  <SpesaItemRow key={item.id} item={item} t={t} canEdit={canEdit}
                    onToggle={spesaV2Toggle} onRemove={spesaV2Remove}/>
                ))}
                {riga.settimanali.length===0&&(
                  <div style={{padding:"8px 0",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:11}}>—</div>
                )}
              </div>
            </div>
          ))}
          {items.length===0&&(
            <div style={{padding:"48px 0",textAlign:"center",color:t.inkFaint}}>
              <div style={{fontFamily:"var(--serif)",fontSize:18,fontStyle:"italic",marginBottom:8}}>Lista vuota</div>
              <div className="mono" style={{fontSize:9}}>AGGIUNGI ARTICOLI CON IL TAB + AGGIUNGI</div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function SpesaItemRow({ item, t, canEdit, onToggle, onRemove }) {
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
}


/* ════════════════════════════════════════════════════════
   ECONOMATO VIEW — flusso professionale
   Lista Spesa + Giacenze + Ordini + Ricezione
   REGOLA: prezzi SOLO qui · stock aggiornato solo dopo conferma
   ════════════════════════════════════════════════════════ */
function EconomatoView({ t }) {
  const { kitchen, ordineAdd, ordineUpdate, confermRicezione, allItems, currentRole } = useK();
  const toast = useToast();
  const canEdit = CAN_EDIT.includes(currentRole());

  const ordini = kitchen?.ordini||[];
  const [tab, setTab]       = useState("ordini");
  const [showForm, setShowForm] = useState(false);
  const [ordineForm, setOrdineForm] = useState({fornitore:"", items:[]});
  const [newItem, setNewItem] = useState({nome:"",qty:"",unit:"kg",prezzoUnit:"",codiceLotto:"",scadeIl:""});
  const [ricezione, setRicezione] = useState(null); // ordineId in ricezione

  function addItemToForm() {
    if(!newItem.nome||!newItem.qty) { toast("Nome e quantità obbligatori","error"); return; }
    setOrdineForm(p=>({...p, items:[...p.items,{
      id:genId(), nome:newItem.nome, quantitaOrdinata:parseFloat(newItem.qty)||0,
      unitaMisura:newItem.unit, prezzoUnitario:parseFloat(newItem.prezzoUnit)||0,
      quantitaRicevuta:null,
    }]}));
    setNewItem({nome:"",qty:"",unit:"kg",prezzoUnit:"",codiceLotto:"",scadeIl:""});
  }

  function saveOrdine() {
    if(!ordineForm.fornitore||!ordineForm.items.length) { toast("Fornitore e almeno un articolo obbligatori","error"); return; }
    ordineAdd(ordineForm.fornitore, ordineForm.items);
    toast("Ordine creato in bozza","success");
    setOrdineForm({fornitore:"", items:[]});
    setShowForm(false);
  }

  function inviaOrdine(id) {
    ordineUpdate(id,{status:"inviato",inviatoIl:nowISO()});
    toast("Ordine inviato","success");
  }

  function confermOrdine(ordine) {
    const ricezioni = (ordine.items||[]).map(i=>({
      nome:i.nome, quantitaRicevuta:i.quantitaOrdinata,
      unitaMisura:i.unitaMisura, prezzoUnitario:i.prezzoUnitario,
      fornitore:ordine.fornitore, codiceLotto:null, scadeIl:null,
    }));
    confermRicezione(ordine.id, ricezioni);
    toast(`Stock aggiornato da ordine ${ordine.id.slice(-4)}!`,"success");
  }

  const STATUS_COLORS = {
    bozza:"#7A7168",inviato:"#C19A3E",
    ricevuto_parziale:"#2A4FA5",ricevuto:"#3D7A4A"
  };
  const STATUS_LABELS = {
    bozza:"Bozza",inviato:"Inviato",
    ricevuto_parziale:"Ricevuto parziale",ricevuto:"Ricevuto ✓"
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        {[{k:"ordini",l:`📋 Ordini (${ordini.length})`},{k:"giacenze",l:"📦 Giacenze Economato"}].map(({k,l})=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:"8px 16px",borderRadius:10,border:"none",cursor:"pointer",
            fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.06em",
            background:tab===k?`linear-gradient(135deg,${t.accent},${t.accentDeep})`:t.bgCard,
            color:tab===k?"#fff":t.inkMuted,boxShadow:`0 1px 4px ${t.shadow}`,transition:"all 0.2s",
          }}>{l}</button>
        ))}
        {canEdit&&(
          <button onClick={()=>setShowForm(f=>!f)} style={{
            marginLeft:"auto",padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",
            background:`linear-gradient(135deg,${t.gold},${t.goldBright})`,color:"#fff",
            fontFamily:"var(--mono)",fontSize:10,
          }}>+ Nuovo Ordine</button>
        )}
      </div>

      {/* Form nuovo ordine */}
      {showForm&&canEdit&&(
        <Card t={t} style={{padding:20}}>
          <div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:12}}>CREA ORDINE</div>
          <LuxInput value={ordineForm.fornitore} onChange={e=>setOrdineForm(p=>({...p,fornitore:e.target.value}))}
            placeholder="Nome fornitore" t={t} style={{marginBottom:12}}/>
          <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:8}}>ARTICOLI</div>
          {ordineForm.items.map((item,i)=>(
            <div key={item.id} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${t.div}`}}>
              <span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink,flex:1}}>{item.nome}</span>
              <span className="mono" style={{fontSize:10,color:t.inkMuted}}>{item.quantitaOrdinata} {item.unitaMisura}</span>
              <span className="mono" style={{fontSize:10,color:t.gold}}>€{item.prezzoUnitario}/{item.unitaMisura}</span>
              <button onClick={()=>setOrdineForm(p=>({...p,items:p.items.filter((_,j)=>j!==i)}))}
                style={{background:"none",border:"none",color:t.danger,cursor:"pointer",fontSize:14}}>✕</button>
            </div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 70px 60px 90px auto",gap:8,marginTop:10}}>
            <LuxInput value={newItem.nome} onChange={e=>setNewItem(p=>({...p,nome:e.target.value}))} placeholder="Articolo" t={t}/>
            <LuxInput value={newItem.qty} onChange={e=>setNewItem(p=>({...p,qty:e.target.value}))} type="number" placeholder="Qtà" t={t}/>
            <LuxSelect value={newItem.unit} onChange={e=>setNewItem(p=>({...p,unit:e.target.value}))} t={t}>
              {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
            </LuxSelect>
            <LuxInput value={newItem.prezzoUnit} onChange={e=>setNewItem(p=>({...p,prezzoUnit:e.target.value}))}
              type="number" placeholder="€/unità" t={t}/>
            <button onClick={addItemToForm} style={{
              padding:"8px 14px",borderRadius:8,border:"none",cursor:"pointer",
              background:t.bgAlt,color:t.ink,fontFamily:"var(--mono)",fontSize:10,
            }}>+ Item</button>
          </div>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <Btn t={t} variant="gold" onClick={saveOrdine} disabled={!ordineForm.fornitore||!ordineForm.items.length}>
              💾 Salva in Bozza
            </Btn>
            <button onClick={()=>setShowForm(false)} style={{
              padding:"8px 16px",borderRadius:8,border:`1px solid ${t.div}`,cursor:"pointer",
              background:"none",color:t.inkMuted,fontFamily:"var(--mono)",fontSize:10,
            }}>Annulla</button>
          </div>
        </Card>
      )}

      {/* Lista ordini */}
      {tab==="ordini"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {ordini.length===0&&(
            <div style={{textAlign:"center",padding:"48px 0",color:t.inkFaint}}>
              <div style={{fontFamily:"var(--serif)",fontSize:18,fontStyle:"italic",marginBottom:8}}>Nessun ordine</div>
            </div>
          )}
          {ordini.map(ordine=>(
            <Card key={ordine.id} t={t} style={{padding:0}}>
              <div style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:14,color:t.ink}}>{ordine.fornitore}</div>
                  <div className="mono" style={{fontSize:8,color:t.inkFaint,marginTop:2}}>
                    {ordine.data} · {(ordine.items||[]).length} articoli
                    {ordine.inviatoIl&&` · Inviato ${fmtDate(ordine.inviatoIl)}`}
                  </div>
                </div>
                <span style={{
                  padding:"3px 10px",borderRadius:6,fontSize:9,fontFamily:"var(--mono)",
                  background:(STATUS_COLORS[ordine.status]||"#7A7168")+"22",
                  border:`1px solid ${(STATUS_COLORS[ordine.status]||"#7A7168")}44`,
                  color:STATUS_COLORS[ordine.status]||"#7A7168",
                }}>{STATUS_LABELS[ordine.status]||ordine.status}</span>
                {canEdit&&ordine.status==="bozza"&&(
                  <Btn t={t} onClick={()=>inviaOrdine(ordine.id)} style={{fontSize:9,padding:"5px 12px"}}>📤 Invia</Btn>
                )}
                {canEdit&&ordine.status==="inviato"&&(
                  <Btn t={t} variant="gold" onClick={()=>confermOrdine(ordine)} style={{fontSize:9,padding:"5px 12px"}}>
                    ✅ Conferma Ricezione → Stock
                  </Btn>
                )}
              </div>
              {(ordine.items||[]).length>0&&(
                <div style={{borderTop:`1px solid ${t.div}`}}>
                  {ordine.items.map((item,i)=>(
                    <div key={item.id||i} style={{padding:"8px 20px",display:"flex",gap:10,alignItems:"center",
                      borderBottom:i<ordine.items.length-1?`1px solid ${t.div}`:undefined}}>
                      <span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink,flex:1}}>{item.nome}</span>
                      <span className="mono" style={{fontSize:9,color:t.inkMuted}}>{item.quantitaOrdinata} {item.unitaMisura}</span>
                      <span className="mono" style={{fontSize:10,color:t.gold}}>€{(item.prezzoUnitario||0).toFixed(2)}/{item.unitaMisura}</span>
                    </div>
                  ))}
                  <div style={{padding:"8px 20px",display:"flex",justifyContent:"flex-end",borderTop:`1px solid ${t.div}`,background:t.bgAlt}}>
                    <span className="mono" style={{fontSize:10,color:t.gold}}>
                      Totale: €{(ordine.items.reduce((s,i)=>s+(i.prezzoUnitario||0)*(i.quantitaOrdinata||0),0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Giacenze economato */}
      {tab==="giacenze"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{padding:"10px 14px",background:t.bgAlt,borderRadius:10,fontFamily:"var(--mono)",fontSize:9,color:t.inkFaint}}>
            ℹ I prezzi sono visibili SOLO in questa sezione · non compaiono negli altri reparti
          </div>
          {allItems().filter(x=>x.category==="economato"||x.location==="dry").map(item=>(
            <Card key={item.id} t={t} style={{padding:"12px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,color:t.ink}}>{item.name}</div>
                  <div className="mono" style={{fontSize:8,color:t.inkFaint,marginTop:2}}>
                    {item.quantity} {item.unit}
                    {item.lot&&` · Lotto: ${item.lot}`}
                    {item.expiresAt&&` · Scad. ${fmtDate(item.expiresAt)}`}
                  </div>
                </div>
                {item.prezzoUnitario&&(
                  <div style={{textAlign:"right"}}>
                    <div className="mono" style={{fontSize:12,color:t.gold,fontWeight:700}}>
                      €{(item.prezzoUnitario*item.quantity).toFixed(2)}
                    </div>
                    <div className="mono" style={{fontSize:8,color:t.inkFaint}}>€{item.prezzoUnitario}/{item.unit}</div>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {allItems().filter(x=>x.category==="economato"||x.location==="dry").length===0&&(
            <div style={{textAlign:"center",padding:"48px 0",color:t.inkFaint,fontFamily:"var(--serif)",fontSize:16,fontStyle:"italic"}}>
              Nessuna giacenza — conferma la ricezione di un ordine per aggiornare lo stock
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   BRIGATA VIEW
   ════════════════════════════════════════════════════════ */
function BrigataView({ t }) {
  const { state, kitchen, addMember, updateRole, removeMember, currentRole, selectMember } = useK();
  const toast = useToast();
  const isAdmin = currentRole()==="admin";

  const [name,setName] = useState("");
  const [role,setRole] = useState("commis");

  if(!kitchen) return null;
  const members = kitchen.members||[];

  const ROLE_STYLE = {
    admin:         {color:"#fff", bg:"#C19A3E"},
    chef:          {color:"#fff", bg:"#8B1E2F"},
    "sous-chef":   {color:"#fff", bg:"#8B1E2F"},
    "capo-partita":{color:"#fff", bg:"#8B1E2F"},
    commis:        {color:"#555", bg:"rgba(0,0,0,0.08)"},
    stagista:      {color:"#555", bg:"rgba(0,0,0,0.08)"},
    staff:         {color:"#555", bg:"rgba(0,0,0,0.08)"},
    fb:            {color:"#555", bg:"rgba(0,0,0,0.08)"},
    mm:            {color:"#555", bg:"rgba(0,0,0,0.08)"},
  };

  function doAdd() {
    if(!name.trim()){toast("Inserisci un nome","error");return;}
    addMember(name,role);
    toast(`${name} aggiunto alla brigata`,"success");
    setName("");
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Current user */}
      <Card t={t} style={{padding:"14px 22px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"var(--serif)",fontSize:16,fontWeight:600}}>
          {(members.find(m=>m.id===state.selectedMemberId)||members[0])?.name?.[0]||"?"}
        </div>
        <div>
          <div style={{fontFamily:"var(--serif)",fontSize:14,fontWeight:500,color:t.ink}}>
            {(members.find(m=>m.id===state.selectedMemberId)||members[0])?.name||"—"}
          </div>
          <div className="mono" style={{fontSize:8,letterSpacing:"0.1em",color:t.inkFaint}}>UTENTE CORRENTE · {currentRole().toUpperCase()}</div>
        </div>
        <div style={{flex:1}}/>
        <div style={{fontSize:9,fontFamily:"var(--mono)",color:t.inkFaint}}>Accedi come:</div>
        <LuxSelect value={state.selectedMemberId||""} onChange={e=>selectMember(e.target.value)} t={t} style={{width:160}}>
          {members.map(m=><option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
        </LuxSelect>
      </Card>

      {isAdmin&&(
        <Card t={t} style={{padding:20}}>
          <div className="mono" style={{fontSize:9,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:14}}>AGGIUNGI MEMBRO</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:10}}>
            <LuxInput value={name} onChange={e=>setName(e.target.value)} placeholder="Nome e cognome" t={t}/>
            <LuxSelect value={role} onChange={e=>setRole(e.target.value)} t={t}>
              {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
            </LuxSelect>
            <Btn t={t} onClick={doAdd} disabled={!name.trim()}>Aggiungi</Btn>
          </div>
        </Card>
      )}

      <Card t={t}>
        <CardHeader t={t} title={`Brigata (${members.length})`}/>
        <div>
          {members.map((m,i)=>{
            const rs = ROLE_STYLE[m.role]||ROLE_STYLE.staff;
            return (
              <div key={m.id} style={{padding:"14px 22px",display:"flex",alignItems:"center",gap:14,borderBottom:i<members.length-1?`1px solid ${t.div}`:"none"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"var(--serif)",fontSize:14,fontWeight:600,flexShrink:0}}>
                  {m.name[0]}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"var(--serif)",fontSize:14,fontWeight:500,color:t.ink}}>{m.name}</div>
                  <div className="mono" style={{fontSize:8,color:t.inkFaint}}>Dal {m.joinedAt?.slice(0,10)||"—"}</div>
                </div>
                {isAdmin&&m.role!=="admin"?(
                  <LuxSelect value={m.role} onChange={e=>updateRole(m.id,e.target.value)} t={t} style={{width:140}}>
                    {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                  </LuxSelect>
                ):(
                  <Badge label={m.role.toUpperCase()} color={rs.color} bg={rs.bg}/>
                )}
                {isAdmin&&m.role!=="admin"&&(
                  <button onClick={()=>{if(confirm(`Rimuovi ${m.name}?`))removeMember(m.id);}} style={{...btnSmall(t),background:t.accentGlow,color:t.danger}}>✕</button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SETTINGS VIEW
   ════════════════════════════════════════════════════════ */
function SettingsView({ t }) {
  const { state, kitchen, createKitchen, selectKitchen, setParCategory, currentRole } = useK();
  const toast = useToast();
  const isAdmin = currentRole()==="admin";

  const [newName, setNewName] = useState("");
  const [newOwner,setNewOwner] = useState("");

  const parKeys = Object.keys(PAR_PRESET);
  const currentPar = kitchen?.parByCategory||{};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Kitchen selector */}
      <Card t={t}>
        <CardHeader t={t} title="Cucine"/>
        <div style={{padding:20}}>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
            {state.kitchens.map(k=>(
              <button key={k.id} onClick={()=>selectKitchen(k.id)} style={{
                padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",
                fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.06em",
                background:(state.selectedKitchenId||state.kitchens[0]?.id)===k.id?`linear-gradient(135deg,${t.gold},${t.goldBright})`:`${t.bgAlt}`,
                color:(state.selectedKitchenId||state.kitchens[0]?.id)===k.id?"#fff":t.inkMuted,
                border:`1px solid ${t.div}`,
              }}>{k.name}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:10}}>
            <LuxInput value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nuova cucina" t={t}/>
            <LuxInput value={newOwner} onChange={e=>setNewOwner(e.target.value)} placeholder="Admin" t={t}/>
            <Btn t={t} onClick={()=>{createKitchen(newName,newOwner);setNewName("");setNewOwner("");toast("Cucina creata","success");}} disabled={!newName.trim()}>Crea</Btn>
          </div>
        </div>
      </Card>

      {/* Par levels */}
      {isAdmin&&(
        <Card t={t}>
          <CardHeader t={t} title="Livelli PAR per categoria"/>
          <div style={{padding:20}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {parKeys.map(key=>(
                <div key={key}>
                  <div className="mono" style={{fontSize:8,letterSpacing:"0.12em",color:t.inkFaint,marginBottom:4}}>{(CATEGORIES[key]||key).toUpperCase()}</div>
                  <LuxInput
                    value={currentPar[key]??PAR_PRESET[key]??0}
                    onChange={e=>setParCategory(key,e.target.value)}
                    type="number" t={t}
                    style={{padding:"7px 10px",fontSize:12}}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   AI ASSISTANT PANEL
   ════════════════════════════════════════════════════════ */
function AIPanel({ t, onClose }) {
  const { allItems, stockAdd, removeItem, kitchen } = useK();
  const [messages, setMessages] = useState([{role:"ai",text:"Ciao! Sono il tuo assistente cucina. Posso aiutarti con le giacenze, scadenze, e liste. Cosa vuoi sapere?"}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const speech = useSpeech(t2=>setInput(t2));

  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[messages]);

  async function send() {
    const msg=input.trim(); if(!msg)return;
    setInput("");
    setMessages(p=>[...p,{role:"user",text:msg}]);

    // Local intent parsing
    const lower=msg.toLowerCase();
    let reply=null;

    const items=allItems();
    const now=new Date();

    if(/scadenz|urgenti|in scadenza/.test(lower)) {
      const urgent=items.filter(x=>{ const h=hoursUntil(x.expiresAt); return h!==null&&h>0&&h<=72; });
      const expired=items.filter(x=>x.expiresAt&&new Date(x.expiresAt)<now);
      if(!urgent.length&&!expired.length) reply="✓ Nessuna scadenza urgente al momento.";
      else {
        const lines=[...expired.map(x=>`⛔ ${x.name} — SCADUTO`), ...urgent.map(x=>`⚠ ${x.name} — ${Math.round(hoursUntil(x.expiresAt))}h rimaste`)];
        reply=lines.join("\n");
      }
    } else if(/low|scorta bassa|sotto par/.test(lower)) {
      const low=items.filter(x=>{ const par=x.parLevel??PAR_PRESET[x.category]??0; return par>0&&x.quantity<par; });
      if(!low.length) reply="✓ Tutti i livelli nella norma.";
      else reply=low.map(x=>`↓ ${x.name}: ${x.quantity} (par ${x.parLevel??PAR_PRESET[x.category]})`).join("\n");
    } else if(/aggiungi|carica/.test(lower)) {
      const m=lower.match(/(\d+[\.,]?\d*)\s*(pz|kg|g|ml|l)?\s+(di\s+)?(.+?)(\s+al\s+(frigo|freezer|dispensa|banco))?$/);
      if(m) {
        const qty=parseFloat(m[1].replace(",",".")), name=m[4].trim();
        const locMap={frigo:"fridge",freezer:"freezer",dispensa:"dry",banco:"counter"};
        const loc=locMap[m[6]||"frigo"]||"fridge";
        if(qty>0&&name){ stockAdd({name,quantity:qty,unit:m[2]||"pz",location:loc}); reply=`✓ ${name} (${qty} ${m[2]||"pz"}) aggiunto in ${loc}.`; }
      }
    } else if(/rimuovi|elimina/.test(lower)) {
      const name=lower.replace(/rimuovi|elimina/,"").trim();
      const found=items.find(x=>x.name.toLowerCase().includes(name));
      if(found){ removeItem(found.id); reply=`✓ ${found.name} rimosso.`; }
      else reply=`Non ho trovato "${name}" in magazzino.`;
    }

    if(reply) { setMessages(p=>[...p,{role:"ai",text:reply}]); return; }

    // Claude API fallback
    setLoading(true);
    try {
      const context=`Cucina: ${kitchen?.name||"—"}. Giacenze: ${items.map(x=>`${x.name} ${x.quantity}${x.unit} (${x.location})`).join(", ")}`;
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:400,
          system:`Sei un assistente chef per cucine Michelin. Rispondi SEMPRE in italiano, in modo conciso. Dati cucina: ${context}`,
          messages:[{role:"user",content:msg}],
        }),
      });
      const data=await res.json();
      const text=data.content?.map(b=>b.text||"").join("")||"(nessuna risposta)";
      setMessages(p=>[...p,{role:"ai",text}]);
    } catch { setMessages(p=>[...p,{role:"ai",text:"Errore di connessione. Verificare la rete."}]); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      position:"fixed",bottom:90,right:24,zIndex:8000,
      width:480,height:520,borderRadius:16,overflow:"hidden",
      boxShadow:`0 20px 60px ${t.shadowStrong}`,
      display:"flex",flexDirection:"column",
      background:t.bgCard,border:`1px solid ${t.div}`,
    }}>
      {/* Header */}
      <div style={{padding:"14px 20px",background:`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <span style={{color:"#fff",fontFamily:"var(--serif)",fontSize:14,fontWeight:500}}>🤖 Assistente AI</span>
          <div className="mono" style={{fontSize:7,color:"rgba(255,255,255,0.5)",letterSpacing:"0.14em",marginTop:1}}>KITCHEN PRO INTELLIGENCE</div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.6)",fontSize:18,cursor:"pointer"}}>✕</button>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{
              maxWidth:"80%",padding:"10px 14px",borderRadius:12,fontSize:12,lineHeight:1.5,
              fontFamily:m.role==="ai"?"var(--serif)":"var(--mono)",fontStyle:m.role==="ai"?"italic":"normal",
              whiteSpace:"pre-wrap",
              background:m.role==="user"?`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`:t.bgAlt,
              color:m.role==="user"?"#fff":t.ink,
              borderBottomRightRadius:m.role==="user"?2:12,
              borderBottomLeftRadius:m.role==="ai"?2:12,
            }}>{m.text}</div>
          </div>
        ))}
        {loading&&<div style={{color:t.inkFaint,fontFamily:"var(--mono)",fontSize:10,animation:"pulse 1.5s ease-in-out infinite"}}>...</div>}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={{padding:"12px 16px",borderTop:`1px solid ${t.div}`,display:"flex",gap:8}}>
        <LuxInput value={input} onChange={e=>setInput(e.target.value)} placeholder="Chiedi qualcosa…" t={t} style={{flex:1}}
          onKeyDown={e=>e.key==="Enter"&&send()}/>
        <VoiceBtn t={t} onResult={r=>setInput(r)}/>
        <Btn t={t} onClick={send} disabled={!input.trim()||loading}>→</Btn>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   SERVIZIO LIVE VIEW — gestione tavoli · biglietti · timer
   ════════════════════════════════════════════════════════ */
function ServizioView({ t }) {
  const { kitchen } = useK();
  const toast = useToast();

  const [serviceActive, setServiceActive] = useState(false);
  const [startTime, setStartTime]         = useState(null);
  const [elapsed, setElapsed]             = useState(0);
  useEffect(()=>{
    if(!serviceActive) return;
    const i = setInterval(()=>setElapsed(Date.now()-(startTime||Date.now())), 1000);
    return()=>clearInterval(i);
  },[serviceActive,startTime]);
  function fmtElapsed(ms) {
    const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;
    return h>0?`${h}:${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
  }

  const [tavoli, setTavoli] = useState(()=>{ try{return JSON.parse(localStorage.getItem(`kp-tavoli-${kitchen?.id}`)||"[]");}catch{return[];} });
  useEffect(()=>{ if(kitchen?.id)localStorage.setItem(`kp-tavoli-${kitchen.id}`,JSON.stringify(tavoli)); },[tavoli,kitchen?.id]);
  const [showAddTavolo, setShowAddTavolo] = useState(false);
  const [nuovoTavolo, setNuovoTavolo]     = useState({numero:"",coperti:"2"});
  function addTavolo() {
    if(!nuovoTavolo.numero){toast("Inserisci numero tavolo","error");return;}
    setTavoli(p=>[...p,{id:genId(),numero:nuovoTavolo.numero,coperti:parseInt(nuovoTavolo.coperti)||2,status:"libero",arrivatoIl:null}]);
    setNuovoTavolo({numero:"",coperti:"2"}); setShowAddTavolo(false);
  }
  function toggleTavoloStatus(id) {
    setTavoli(p=>p.map(tv=>tv.id!==id?tv:{...tv,
      status:tv.status==="libero"?"occupato":tv.status==="occupato"?"conto":"libero",
      arrivatoIl:tv.status==="libero"?nowISO():tv.arrivatoIl,
    }));
  }

  const [tickets, setTickets] = useState(()=>{ try{return JSON.parse(localStorage.getItem(`kp-tickets-${kitchen?.id}`)||"[]");}catch{return[];} });
  useEffect(()=>{ if(kitchen?.id)localStorage.setItem(`kp-tickets-${kitchen.id}`,JSON.stringify(tickets)); },[tickets,kitchen?.id]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm]         = useState({tavolo:"",portata:"",note:"",stazione:"saucier"});
  function addTicket() {
    if(!ticketForm.portata.trim()){toast("Inserisci la portata","error");return;}
    setTickets(p=>[{id:genId(),tavolo:ticketForm.tavolo,portata:ticketForm.portata.trim(),stazione:ticketForm.stazione,note:ticketForm.note,status:"in_attesa",createdAt:nowISO()},...p]);
    toast(`Biglietto: ${ticketForm.portata}`,"success");
    setTicketForm(p=>({...p,portata:"",note:""})); setShowTicketForm(false);
  }
  function ticketStatus(id,status){ setTickets(p=>p.map(tk=>tk.id!==id?tk:{...tk,status,completatoIl:status==="pronto"?nowISO():tk.completatoIl})); }

  const tavoliOccupati = tavoli.filter(tv=>tv.status==="occupato"||tv.status==="conto");
  const copertiFattivi = tavoliOccupati.reduce((s,tv)=>s+tv.coperti,0);
  const ticketsAttivi  = tickets.filter(tk=>tk.status!=="consegnato"&&tk.status!=="annullato");
  const ticketsPronti  = tickets.filter(tk=>tk.status==="pronto");
  const STAZIONI_SV = [{k:"saucier",l:"Saucier",c:"#8B1E2F"},{k:"poissonnier",l:"Poissonnier",c:"#2A4FA5"},{k:"rotisseur",l:"Rôtisseur",c:"#8B4A1E"},{k:"garde",l:"Garde M.",c:"#3D7A4A"},{k:"patissier",l:"Pâtissier",c:"#7A5A1E"}];
  const TAVOLO_C = {libero:{bg:t.bgAlt,border:t.div,tc:t.inkFaint,lb:"Libero"},occupato:{bg:t.success+"18",border:t.success,tc:t.success,lb:"Occupato"},conto:{bg:t.gold+"22",border:t.gold,tc:t.gold,lb:"Conto"}};
  const TICKET_C = {in_attesa:{bg:t.warning+"18",border:t.warning,tc:t.warning,lb:"In attesa"},in_corso:{bg:t.secondary+"22",border:t.secondary,tc:t.secondary,lb:"In lavorazione"},pronto:{bg:t.success+"18",border:t.success,tc:t.success,lb:"Pronto ✓"},consegnato:{bg:t.bgAlt,border:t.div,tc:t.inkFaint,lb:"Consegnato"}};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <Card t={t} glow={serviceActive} style={{padding:"20px 24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
          <div style={{flex:1}}>
            <div className="mono" style={{fontSize:8,letterSpacing:"0.16em",color:t.inkFaint,marginBottom:6}}>{serviceActive?"SERVIZIO ATTIVO":"SERVIZIO FERMO"}</div>
            <div style={{fontFamily:"var(--serif)",fontSize:40,fontWeight:300,color:serviceActive?t.success:t.inkFaint,lineHeight:1}}>{fmtElapsed(elapsed)}</div>
            {serviceActive&&startTime&&<div className="mono" style={{fontSize:9,color:t.inkFaint,marginTop:4}}>Iniziato alle {new Date(startTime).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}</div>}
          </div>
          <button onClick={()=>{if(!serviceActive){setServiceActive(true);setStartTime(Date.now());setElapsed(0);toast("Servizio avviato","success");}else{setServiceActive(false);toast(`Servizio chiuso · ${fmtElapsed(elapsed)}`,"success");}}} style={{padding:"12px 24px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:11,letterSpacing:"0.08em",background:serviceActive?`linear-gradient(135deg,${t.danger},${t.accentDeep})`:`linear-gradient(135deg,${t.success},#2a5e38)`,color:"#fff",transition:"all 0.3s"}}>{serviceActive?"⏹ Chiudi":"▶ Avvia Servizio"}</button>
          <div style={{display:"flex",gap:16}}>
            {[{l:"TAVOLI",v:tavoliOccupati.length+"/"+tavoli.length,c:t.gold},{l:"COPERTI",v:copertiFattivi,c:t.success},{l:"BIGLIETTI",v:ticketsAttivi.length,c:ticketsAttivi.length>0?t.warning:t.inkFaint},{l:"PRONTI",v:ticketsPronti.length,c:ticketsPronti.length>0?t.success:t.inkFaint}].map(kpi=>(
              <div key={kpi.l} style={{textAlign:"center"}}>
                <div style={{fontSize:22,fontFamily:"var(--serif)",fontWeight:300,color:kpi.c,lineHeight:1}}>{kpi.v}</div>
                <div className="mono" style={{fontSize:7,color:t.inkFaint,marginTop:2}}>{kpi.l}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Sala */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div className="mono" style={{fontSize:9,letterSpacing:"0.14em",color:t.inkFaint}}>SALA</div>
          <button onClick={()=>setShowAddTavolo(f=>!f)} style={{padding:"5px 14px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:9,background:`linear-gradient(135deg,${t.gold},${t.goldBright})`,color:"#fff"}}>+ Tavolo</button>
        </div>
        {showAddTavolo&&(<Card t={t} style={{padding:16,marginBottom:12}}><div style={{display:"flex",gap:10,alignItems:"center"}}><LuxInput value={nuovoTavolo.numero} onChange={e=>setNuovoTavolo(p=>({...p,numero:e.target.value}))} placeholder="N. tavolo" t={t} style={{flex:1}}/><LuxInput value={nuovoTavolo.coperti} onChange={e=>setNuovoTavolo(p=>({...p,coperti:e.target.value}))} type="number" placeholder="Coperti" t={t} style={{width:90}}/><Btn t={t} variant="gold" onClick={addTavolo}>Aggiungi</Btn></div></Card>)}
        {tavoli.length===0?(<div style={{textAlign:"center",padding:"32px 0",color:t.inkFaint}}><div style={{fontFamily:"var(--serif)",fontSize:16,fontStyle:"italic"}}>Nessun tavolo — premi + per aggiungere</div></div>):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:10}}>
            {tavoli.map(tv=>{const sc=TAVOLO_C[tv.status]||TAVOLO_C.libero;return(
              <div key={tv.id} style={{borderRadius:14,border:`2px solid ${sc.border}`,background:sc.bg,padding:"14px 16px",cursor:"pointer",transition:"all 0.25s",position:"relative"}} onClick={()=>toggleTavoloStatus(tv.id)} onContextMenu={e=>{e.preventDefault();if(confirm(`Rimuovi tavolo ${tv.numero}?`))setTavoli(p=>p.filter(x=>x.id!==tv.id));}}>
                <div style={{fontFamily:"var(--serif)",fontSize:22,fontWeight:300,color:sc.tc,lineHeight:1}}>T.{tv.numero}</div>
                <div className="mono" style={{fontSize:8,color:sc.tc,marginTop:4,opacity:0.8}}>{tv.coperti} cop.</div>
                <div style={{position:"absolute",top:8,right:8,fontSize:7,fontFamily:"var(--mono)",padding:"2px 5px",borderRadius:4,background:sc.border+"33",color:sc.tc}}>{sc.lb}</div>
                {tv.status==="occupato"&&tv.arrivatoIl&&<div className="mono" style={{fontSize:7,color:sc.tc,marginTop:2,opacity:0.6}}>{Math.floor((Date.now()-new Date(tv.arrivatoIl))/60000)}min</div>}
              </div>
            );})}
          </div>
        )}
      </div>

      {/* Biglietti */}
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div className="mono" style={{fontSize:9,letterSpacing:"0.14em",color:t.inkFaint}}>BIGLIETTI · {ticketsAttivi.length} attivi</div>
          <button onClick={()=>setShowTicketForm(f=>!f)} style={{padding:"5px 14px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:9,background:`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`,color:"#fff"}}>+ Biglietto</button>
        </div>
        {showTicketForm&&(<Card t={t} style={{padding:16,marginBottom:12}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}><LuxInput value={ticketForm.tavolo} onChange={e=>setTicketForm(p=>({...p,tavolo:e.target.value}))} placeholder="Tavolo" t={t}/><LuxSelect value={ticketForm.stazione} onChange={e=>setTicketForm(p=>({...p,stazione:e.target.value}))} t={t}>{STAZIONI_SV.map(s=><option key={s.k} value={s.k}>{s.l}</option>)}</LuxSelect><LuxInput value={ticketForm.portata} onChange={e=>setTicketForm(p=>({...p,portata:e.target.value}))} placeholder="Portata" t={t} style={{gridColumn:"1/-1"}}/><LuxInput value={ticketForm.note} onChange={e=>setTicketForm(p=>({...p,note:e.target.value}))} placeholder="Note allergie / preferenze" t={t} style={{gridColumn:"1/-1"}}/></div><Btn t={t} variant="primary" onClick={addTicket} disabled={!ticketForm.portata.trim()}>+ Invia Biglietto</Btn></Card>)}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
          {["in_attesa","in_corso","pronto"].map(status=>{
            const list=tickets.filter(tk=>tk.status===status);
            const sc=TICKET_C[status];
            return(<div key={status} style={{borderRadius:12,border:`1px solid ${sc.border}`,overflow:"hidden"}}>
              <div style={{padding:"10px 14px",background:sc.bg,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span className="mono" style={{fontSize:9,letterSpacing:"0.1em",color:sc.tc}}>{sc.lb.toUpperCase()}</span>
                <span style={{fontSize:10,fontFamily:"var(--mono)",color:sc.tc}}>{list.length}</span>
              </div>
              <div>{list.length===0?(<div style={{padding:"20px 14px",textAlign:"center",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12}}>—</div>):list.map((tk,i)=>{const st=STAZIONI_SV.find(s=>s.k===tk.stazione)||STAZIONI_SV[0];const age=Math.floor((Date.now()-new Date(tk.createdAt))/60000);return(<div key={tk.id} style={{padding:"11px 14px",borderBottom:i<list.length-1?`1px solid ${t.div}`:"none",background:t.bgCard,borderLeft:`3px solid ${st.c}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink,fontWeight:500,lineHeight:1.3}}>{tk.portata}</span><span className="mono" style={{fontSize:8,color:age>15?t.danger:t.inkFaint,flexShrink:0,marginLeft:6}}>{age}min</span></div>{tk.tavolo&&<div className="mono" style={{fontSize:8,color:st.c,marginBottom:3}}>{tk.tavolo} · {st.l}</div>}{tk.note&&<div style={{fontSize:10,fontFamily:"var(--serif)",fontStyle:"italic",color:t.warning,marginBottom:5}}>⚠ {tk.note}</div>}<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{status==="in_attesa"&&<button onClick={()=>ticketStatus(tk.id,"in_corso")} style={{...btnSmall(t),fontSize:8,background:t.secondary+"22",color:t.secondary}}>▶ Avvia</button>}{status==="in_corso"&&<button onClick={()=>ticketStatus(tk.id,"pronto")} style={{...btnSmall(t),fontSize:8,background:t.success+"22",color:t.success}}>✓ Pronto</button>}{status==="pronto"&&<button onClick={()=>ticketStatus(tk.id,"consegnato")} style={{...btnSmall(t),fontSize:8,background:t.gold+"22",color:t.gold}}>↗ Consegnato</button>}<button onClick={()=>setTickets(p=>p.filter(x=>x.id!==tk.id))} style={{...btnSmall(t),fontSize:8,background:t.accentGlow,color:t.danger}}>✕</button></div></div>);})}</div>
            </div>);
          })}
        </div>
        {tickets.filter(tk=>tk.status==="consegnato").length>0&&(<div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span className="mono" style={{fontSize:9,color:t.inkFaint}}>{tickets.filter(tk=>tk.status==="consegnato").length} portate consegnate</span><button onClick={()=>setTickets(p=>p.filter(tk=>tk.status!=="consegnato"))} style={{...btnSmall(t),fontSize:8}}>Pulisci storico</button></div>)}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   HACCP VIEW — temperature · FIFO · allergen · storico
   Conforme Reg. EU 852/2004
   ════════════════════════════════════════════════════════ */
function HaccpView({ t }) {
  const { kitchen } = useK();
  const toast = useToast();
  const STORAGE_KEY = `kp-haccp-${kitchen?.id}`;
  const [logs, setLogs] = useState(()=>{ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch{return[];} });
  useEffect(()=>{ if(kitchen?.id)localStorage.setItem(STORAGE_KEY,JSON.stringify(logs)); },[logs,kitchen?.id]);

  const [tab, setTab] = useState("temp");
  const [form, setForm] = useState({zona:"Frigo 1",temp:"",operatore:"",note:""});

  const ZONE = ["Frigo 1","Frigo 2","Congelatore 1","Congelatore 2","Abbattitore","Frigo Pesce","Banco Freddo","Cella Pasticceria"];
  const LIMITI = {"Frigo 1":{min:0,max:4},"Frigo 2":{min:0,max:4},"Congelatore 1":{min:-22,max:-15},"Congelatore 2":{min:-22,max:-15},"Abbattitore":{min:-40,max:0},"Frigo Pesce":{min:0,max:2},"Banco Freddo":{min:0,max:4},"Cella Pasticceria":{min:2,max:6}};
  const ALLERGENS = [{k:"glutine",l:"Glutine",i:"🌾"},{k:"crostacei",l:"Crostacei",i:"🦐"},{k:"uova",l:"Uova",i:"🥚"},{k:"pesce",l:"Pesce",i:"🐟"},{k:"arachidi",l:"Arachidi",i:"🥜"},{k:"soia",l:"Soia",i:"🫘"},{k:"latte",l:"Latte",i:"🥛"},{k:"frutta_guscio",l:"Frutta a guscio",i:"🌰"},{k:"sedano",l:"Sedano",i:"🥬"},{k:"senape",l:"Senape",i:"🟡"},{k:"sesamo",l:"Sesamo",i:"🌱"},{k:"solfiti",l:"Solfiti",i:"🍷"},{k:"lupini",l:"Lupini",i:"🌿"},{k:"molluschi",l:"Molluschi",i:"🦑"}];

  function salvaTemp() {
    const val=parseFloat(form.temp); if(!form.zona||isNaN(val)){toast("Zona e temperatura obbligatori","error");return;}
    const lim=LIMITI[form.zona]||{min:-30,max:10};
    const ok=val>=lim.min&&val<=lim.max;
    setLogs(p=>[{id:genId(),tipo:"temperatura",zona:form.zona,temp:val,operatore:form.operatore||"—",note:form.note,conformeHaccp:ok,registratoIl:nowISO()},...p]);
    if(!ok)toast(`⚠ ${form.zona}: ${val}°C FUORI LIMITE (${lim.min}–${lim.max}°C)`,"error");
    else toast(`✓ ${form.zona}: ${val}°C registrato`,"success");
    setForm(p=>({...p,temp:"",note:""}));
  }

  const oggi = todayDate();
  const logOggi = logs.filter(l=>l.registratoIl?.startsWith(oggi));
  const nonConf = logs.filter(l=>!l.conformeHaccp&&l.registratoIl?.startsWith(oggi));
  const allStock = [...(kitchen?.freezer||[]),...(kitchen?.fridge||[]),...(kitchen?.dry||[]),...(kitchen?.counter||[])];
  const fifoAlert = allStock.filter(i=>i.expiresAt&&["critica","in_scadenza","scaduta"].includes(computeStatoScadenza(i.expiresAt)));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {nonConf.length>0&&(<div style={{padding:"14px 18px",borderRadius:12,background:"rgba(139,30,47,0.12)",border:"1.5px solid #8B1E2F",animation:"pulse 2s ease-in-out infinite"}}><div className="mono" style={{fontSize:9,letterSpacing:"0.12em",color:"#8B1E2F",marginBottom:6}}>⚠ NON CONFORMITÀ HACCP OGGI</div>{nonConf.map(l=>(<div key={l.id} style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink,marginTop:4}}>· {l.zona}: {l.temp}°C alle {l.registratoIl?.slice(11,16)}</div>))}</div>)}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[{k:"temp",l:`🌡 Temperature (${logOggi.length} oggi)`},{k:"fifo",l:`📦 FIFO (${fifoAlert.length})`},{k:"allergen",l:"⚠ Allergeni"},{k:"storico",l:"📋 Storico"}].map(({k,l})=>(<button key={k} onClick={()=>setTab(k)} style={{padding:"8px 16px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.06em",background:tab===k?`linear-gradient(135deg,${t.accent},${t.accentDeep})`:t.bgCard,color:tab===k?"#fff":t.inkMuted,boxShadow:`0 1px 4px ${t.shadow}`,transition:"all 0.2s"}}>{l}</button>))}
      </div>

      {tab==="temp"&&(<div style={{display:"flex",flexDirection:"column",gap:16}}>
        <Card t={t} style={{padding:20}}>
          <div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:12}}>REGISTRA TEMPERATURA</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <LuxSelect value={form.zona} onChange={e=>setForm(p=>({...p,zona:e.target.value}))} t={t}>{ZONE.map(z=><option key={z} value={z}>{z}</option>)}</LuxSelect>
            <div style={{position:"relative"}}><LuxInput value={form.temp} onChange={e=>setForm(p=>({...p,temp:e.target.value}))} type="number" placeholder="Temperatura °C" t={t}/>{form.temp&&(()=>{const v=parseFloat(form.temp),l=LIMITI[form.zona]||{min:-30,max:10},ok=v>=l.min&&v<=l.max;return<span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:12}}>{ok?"✅":"❌"}</span>;})()}</div>
            <LuxInput value={form.operatore} onChange={e=>setForm(p=>({...p,operatore:e.target.value}))} placeholder="Operatore" t={t}/>
            <LuxInput value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} placeholder="Note / azione correttiva" t={t}/>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <Btn t={t} variant="gold" onClick={salvaTemp} disabled={!form.temp}>Registra</Btn>
            {form.zona&&LIMITI[form.zona]&&<span className="mono" style={{fontSize:9,color:t.inkFaint}}>Limiti: {LIMITI[form.zona].min}°C ÷ {LIMITI[form.zona].max}°C</span>}
          </div>
        </Card>
        {logOggi.length>0&&(<Card t={t} style={{padding:0}}><CardHeader t={t} title={`Registrazioni oggi (${logOggi.length})`}/>{logOggi.map((l,i)=>(<div key={l.id} style={{padding:"11px 20px",borderBottom:i<logOggi.length-1?`1px solid ${t.div}`:"none",display:"flex",alignItems:"center",gap:12,background:!l.conformeHaccp?"rgba(139,30,47,0.05)":undefined}}><div style={{flex:1}}><div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,color:t.ink}}>{l.zona}</div><div className="mono" style={{fontSize:8,color:t.inkFaint,marginTop:2}}>{l.registratoIl?.slice(11,16)} · {l.operatore}{l.note&&` · ${l.note}`}</div></div><span style={{fontSize:18,fontFamily:"var(--serif)",fontWeight:300,color:l.conformeHaccp?t.success:t.danger}}>{l.temp}°C</span><span style={{fontSize:14}}>{l.conformeHaccp?"✅":"❌"}</span></div>))}</Card>)}
      </div>)}

      {tab==="fifo"&&(<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{padding:"10px 14px",background:t.bgAlt,borderRadius:10,fontFamily:"var(--mono)",fontSize:9,color:t.inkFaint}}>ℹ FIFO — First In First Out: usa prima i prodotti con scadenza più vicina</div>
        {fifoAlert.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:16}}>✓ Tutte le giacenze sono conformi FIFO</div>}
        {fifoAlert.sort((a,b)=>new Date(a.expiresAt)-new Date(b.expiresAt)).map(item=>{
          const stato=computeStatoScadenza(item.expiresAt);
          const cc={scaduta:{bg:"#8B1E2F",c:"#fff",l:"SCADUTO"},critica:{bg:"rgba(139,30,47,0.15)",c:"#8B1E2F",l:"< 12h"},in_scadenza:{bg:"rgba(193,154,62,0.15)",c:"#C19A3E",l:"< 48h"}};
          const sc=cc[stato]||cc.in_scadenza;
          return(<Card key={item.id} t={t} style={{padding:"14px 20px",background:sc.bg,border:`1px solid ${sc.c}44`}}><div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:18}}>{LOCATION_ICONS[item.location]||"📦"}</span><div style={{flex:1}}><div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,color:t.ink,fontWeight:500}}>{item.name}</div><div className="mono" style={{fontSize:8,color:t.inkFaint,marginTop:2}}>{item.quantity} {item.unit} · {item.location?.toUpperCase()}{item.lot&&` · Lotto: ${item.lot}`}</div></div><div style={{textAlign:"right"}}><div className="mono" style={{fontSize:10,color:sc.c,fontWeight:600}}>{sc.l}</div><div className="mono" style={{fontSize:8,color:t.inkFaint,marginTop:2}}>Scad. {fmtDate(item.expiresAt)}</div></div></div></Card>);
        })}
      </div>)}

      {tab==="allergen"&&(<div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div style={{padding:"12px 16px",background:t.bgAlt,borderRadius:10}}>
          <div className="mono" style={{fontSize:8,letterSpacing:"0.12em",color:t.inkFaint,marginBottom:8}}>14 ALLERGENI — REG. UE 1169/2011</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
            {ALLERGENS.map(al=>(<div key={al.k} style={{padding:"10px 12px",borderRadius:10,border:`1px solid ${t.div}`,display:"flex",alignItems:"center",gap:8,background:t.bgCard}}><span style={{fontSize:18}}>{al.i}</span><span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink}}>{al.l}</span></div>))}
          </div>
        </div>
        <div style={{padding:"12px 16px",background:t.goldFaint,borderRadius:10,border:`1px solid ${t.goldDim}`}}>
          <div className="mono" style={{fontSize:8,letterSpacing:"0.12em",color:t.gold,marginBottom:6}}>REGOLA HACCP ALLERGENI</div>
          <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.inkSoft,lineHeight:1.6}}>Ogni prodotto contenente allergeni deve essere chiaramente etichettato. Il personale deve essere formato. In caso di richiesta cliente verificare sempre la scheda tecnica.</div>
        </div>
      </div>)}

      {tab==="storico"&&(<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {logs.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:16}}>Nessuna registrazione storica</div>}
        {logs.slice(0,60).map(l=>(<div key={l.id} style={{padding:"10px 16px",borderRadius:10,background:l.conformeHaccp?t.bgCard:"rgba(139,30,47,0.08)",border:`1px solid ${l.conformeHaccp?t.div:"#8B1E2F44"}`,display:"flex",alignItems:"center",gap:12}}><div style={{flex:1}}><div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink}}>{l.zona}</div><div className="mono" style={{fontSize:8,color:t.inkFaint}}>{l.registratoIl?.slice(0,16).replace("T"," ")} · {l.operatore}</div></div><span style={{fontFamily:"var(--serif)",fontSize:16,color:l.conformeHaccp?t.success:t.danger,fontWeight:300}}>{l.temp}°C</span><span style={{fontSize:12}}>{l.conformeHaccp?"✅":"❌"}</span><button onClick={()=>setLogs(p=>p.filter(x=>x.id!==l.id))} style={{...btnSmall(t),background:t.accentGlow,color:t.danger,fontSize:8}}>✕</button></div>))}
        {logs.length>0&&<button onClick={()=>{if(confirm("Cancella tutto lo storico HACCP?"))setLogs([]);}} style={{...btnSmall(t),alignSelf:"flex-end",background:t.accentGlow,color:t.danger,marginTop:8}}>Cancella storico</button>}
      </div>)}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   FOOD COST VIEW — schede ricetta · waste log · analisi
   ════════════════════════════════════════════════════════ */
function FoodCostView({ t }) {
  const { kitchen } = useK();
  const toast = useToast();
  const STORAGE_KEY = `kp-foodcost-${kitchen?.id}`;
  const [ricette, setRicette] = useState(()=>{ try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch{return[];} });
  useEffect(()=>{ if(kitchen?.id)localStorage.setItem(STORAGE_KEY,JSON.stringify(ricette)); },[ricette,kitchen?.id]);
  const WASTE_KEY = `kp-waste-${kitchen?.id}`;
  const [wasteLog, setWasteLog] = useState(()=>{ try{return JSON.parse(localStorage.getItem(WASTE_KEY)||"[]");}catch{return[];} });
  useEffect(()=>{ if(kitchen?.id)localStorage.setItem(WASTE_KEY,JSON.stringify(wasteLog)); },[wasteLog,kitchen?.id]);

  const [tab, setTab] = useState("ricette");
  const [showForm, setShowForm]   = useState(false);
  const [showWaste, setShowWaste] = useState(false);
  const [rForm, setRForm] = useState({nome:"",categKey:"secondi",porzioni:"4",ingredienti:[],prezzoVendita:""});
  const [newIng, setNewIng] = useState({nome:"",qty:"",unit:"g",costoKg:""});
  const [wForm, setWForm]   = useState({nome:"",qty:"",unit:"kg",motivo:"scadenza",valore:""});

  function addIng() {
    if(!newIng.nome||!newIng.qty){toast("Nome e quantità","error");return;}
    const qty=parseFloat(newIng.qty)||0,costoKg=parseFloat(newIng.costoKg)||0;
    setRForm(p=>({...p,ingredienti:[...p.ingredienti,{id:genId(),nome:newIng.nome,qty,unit:newIng.unit,costoKg,costoTotale:(qty/1000)*costoKg}]}));
    setNewIng({nome:"",qty:"",unit:"g",costoKg:""});
  }
  function salvaRicetta() {
    if(!rForm.nome.trim()||!rForm.ingredienti.length){toast("Nome e ingredienti","error");return;}
    const costTot=rForm.ingredienti.reduce((s,i)=>s+i.costoTotale,0);
    const porz=parseInt(rForm.porzioni)||1,costP=costTot/porz;
    const pv=parseFloat(rForm.prezzoVendita)||0,fc=pv>0?(costP/pv)*100:0;
    setRicette(p=>[{id:genId(),nome:rForm.nome,categoriaKey:rForm.categKey,porzioni:porz,ingredienti:rForm.ingredienti,costTotale:costTot,costoPorzione:costP,prezzoVendita:pv,foodCostPct:fc,createdAt:nowISO()},...p]);
    toast(`${rForm.nome} — food cost: ${fc.toFixed(1)}%`,"success");
    setRForm({nome:"",categKey:"secondi",porzioni:"4",ingredienti:[],prezzoVendita:""}); setShowForm(false);
  }
  function salvaWaste() {
    if(!wForm.nome||!wForm.qty){toast("Nome e quantità","error");return;}
    setWasteLog(p=>[{id:genId(),nome:wForm.nome,qty:parseFloat(wForm.qty)||0,unit:wForm.unit,motivo:wForm.motivo,valore:parseFloat(wForm.valore)||0,at:nowISO()},...p]);
    toast(`Spreco: ${wForm.nome}`,"success");
    setWForm({nome:"",qty:"",unit:"kg",motivo:"scadenza",valore:""}); setShowWaste(false);
  }

  const fcColors = (pct)=>pct===0?{c:t.inkFaint,l:"N/D"}:pct<=25?{c:t.success,l:"Eccellente"}:pct<=32?{c:t.gold,l:"Buono"}:pct<=40?{c:t.warning,l:"Alto"}:{c:t.danger,l:"Critico"};
  const totWaste = wasteLog.reduce((s,w)=>s+w.valore,0);
  const MOTIVI = [{k:"scadenza",l:"Scadenza"},{k:"preparazione",l:"Preparazione"},{k:"cottura",l:"Errore cottura"},{k:"sovra_produzione",l:"Sovra-produzione"},{k:"altro",l:"Altro"}];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        {[{k:"ricette",l:`📋 Ricette (${ricette.length})`},{k:"waste",l:`🗑 Waste (${wasteLog.length})`},{k:"analisi",l:"📊 Analisi"}].map(({k,l})=>(<button key={k} onClick={()=>setTab(k)} style={{padding:"8px 16px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.06em",background:tab===k?`linear-gradient(135deg,${t.accent},${t.accentDeep})`:t.bgCard,color:tab===k?"#fff":t.inkMuted,boxShadow:`0 1px 4px ${t.shadow}`,transition:"all 0.2s"}}>{l}</button>))}
        {tab==="ricette"&&<button onClick={()=>setShowForm(f=>!f)} style={{marginLeft:"auto",padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${t.gold},${t.goldBright})`,color:"#fff",fontFamily:"var(--mono)",fontSize:10}}>+ Nuova Ricetta</button>}
        {tab==="waste"&&<button onClick={()=>setShowWaste(f=>!f)} style={{marginLeft:"auto",padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${t.accent},${t.accentDeep})`,color:"#fff",fontFamily:"var(--mono)",fontSize:10}}>+ Registra Spreco</button>}
      </div>

      {tab==="ricette"&&showForm&&(<Card t={t} style={{padding:20}}>
        <div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:12}}>NUOVA SCHEDA RICETTA</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <LuxInput value={rForm.nome} onChange={e=>setRForm(p=>({...p,nome:e.target.value}))} placeholder="Nome ricetta" t={t} style={{gridColumn:"1/-1"}}/>
          <LuxSelect value={rForm.categKey} onChange={e=>setRForm(p=>({...p,categKey:e.target.value}))} t={t}>{CATEGORIE_MENU.filter(c=>c.key!=="svolte").map(c=><option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}</LuxSelect>
          <LuxInput value={rForm.porzioni} onChange={e=>setRForm(p=>({...p,porzioni:e.target.value}))} type="number" placeholder="N. porzioni" t={t}/>
          <LuxInput value={rForm.prezzoVendita} onChange={e=>setRForm(p=>({...p,prezzoVendita:e.target.value}))} type="number" placeholder="Prezzo vendita €" t={t} style={{gridColumn:"1/-1"}}/>
        </div>
        <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:8}}>INGREDIENTI</div>
        {rForm.ingredienti.map((ing,i)=>(<div key={ing.id} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${t.div}`,alignItems:"center"}}><span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink,flex:1}}>{ing.nome}</span><span className="mono" style={{fontSize:10,color:t.inkMuted}}>{ing.qty}{ing.unit}</span><span className="mono" style={{fontSize:10,color:t.gold}}>€{ing.costoTotale.toFixed(2)}</span><button onClick={()=>setRForm(p=>({...p,ingredienti:p.ingredienti.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",color:t.danger,cursor:"pointer",fontSize:12}}>✕</button></div>))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 70px 60px 100px auto",gap:8,marginTop:10}}>
          <LuxInput value={newIng.nome} onChange={e=>setNewIng(p=>({...p,nome:e.target.value}))} placeholder="Ingrediente" t={t}/>
          <LuxInput value={newIng.qty} onChange={e=>setNewIng(p=>({...p,qty:e.target.value}))} type="number" placeholder="Qtà" t={t}/>
          <LuxSelect value={newIng.unit} onChange={e=>setNewIng(p=>({...p,unit:e.target.value}))} t={t}>{["g","kg","ml","l","pz"].map(u=><option key={u} value={u}>{u}</option>)}</LuxSelect>
          <LuxInput value={newIng.costoKg} onChange={e=>setNewIng(p=>({...p,costoKg:e.target.value}))} type="number" placeholder="€/kg" t={t}/>
          <button onClick={addIng} style={{padding:"8px 12px",borderRadius:8,border:"none",cursor:"pointer",background:t.bgAlt,color:t.ink,fontFamily:"var(--mono)",fontSize:10}}>+</button>
        </div>
        {rForm.ingredienti.length>0&&(()=>{const ct=rForm.ingredienti.reduce((s,i)=>s+i.costoTotale,0),cp=ct/(parseInt(rForm.porzioni)||1),pv=parseFloat(rForm.prezzoVendita)||0,fc=pv>0?(cp/pv)*100:0,fcc=fcColors(fc);return(<div style={{display:"flex",gap:16,padding:"12px 0",marginTop:6,borderTop:`1px solid ${t.div}`}}><div><div className="mono" style={{fontSize:7,color:t.inkFaint}}>COSTO TOT.</div><div style={{fontFamily:"var(--serif)",fontSize:16,color:t.ink}}>€{ct.toFixed(2)}</div></div><div><div className="mono" style={{fontSize:7,color:t.inkFaint}}>COSTO/PORZ.</div><div style={{fontFamily:"var(--serif)",fontSize:16,color:t.ink}}>€{cp.toFixed(2)}</div></div>{pv>0&&<div><div className="mono" style={{fontSize:7,color:t.inkFaint}}>FOOD COST%</div><div style={{fontFamily:"var(--serif)",fontSize:16,color:fcc.c,fontWeight:500}}>{fc.toFixed(1)}%</div></div>}</div>);})()}
        <Btn t={t} variant="gold" onClick={salvaRicetta} disabled={!rForm.nome.trim()||!rForm.ingredienti.length} style={{marginTop:12}}>💾 Salva Ricetta</Btn>
      </Card>)}

      {tab==="ricette"&&!showForm&&(<div style={{display:"flex",flexDirection:"column",gap:12}}>
        {ricette.length===0&&<div style={{textAlign:"center",padding:"48px 0",color:t.inkFaint}}><div style={{fontFamily:"var(--serif)",fontSize:18,fontStyle:"italic",marginBottom:8}}>Nessuna scheda ricetta</div><div className="mono" style={{fontSize:9}}>CREA LA TUA PRIMA RICETTA</div></div>}
        {ricette.map(r=>{const cat=CATEGORIE_MENU.find(c=>c.key===r.categoriaKey),fcc=fcColors(r.foodCostPct);return(<Card key={r.id} t={t} style={{padding:0}}><div style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:20}}>{cat?.icon||"📋"}</span><div style={{flex:1}}><div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:14,color:t.ink,fontWeight:500}}>{r.nome}</div><div className="mono" style={{fontSize:8,color:t.inkFaint,marginTop:2}}>{r.porzioni} porz. · €{r.costoPorzione.toFixed(2)}/porz.</div></div><div style={{textAlign:"right"}}>{r.foodCostPct>0&&<div className="mono" style={{fontSize:13,color:fcc.c,fontWeight:600}}>{r.foodCostPct.toFixed(1)}%</div>}<div className="mono" style={{fontSize:8,color:t.gold}}>€{(r.prezzoVendita||0).toFixed(2)}</div></div><button onClick={()=>setRicette(p=>p.filter(x=>x.id!==r.id))} style={{...btnSmall(t),background:t.accentGlow,color:t.danger,fontSize:9}}>✕</button></div><div style={{padding:"0 20px 12px",display:"flex",flexWrap:"wrap",gap:6}}>{r.ingredienti.map(ing=>(<span key={ing.id} style={{padding:"2px 8px",borderRadius:6,background:t.bgAlt,border:`1px solid ${t.div}`,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:11,color:t.inkSoft}}>{ing.nome} {ing.qty}{ing.unit}</span>))}</div></Card>);})}
      </div>)}

      {tab==="waste"&&(<div style={{display:"flex",flexDirection:"column",gap:12}}>
        {showWaste&&(<Card t={t} style={{padding:20}}><div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:12}}>REGISTRA SPRECO</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}><LuxInput value={wForm.nome} onChange={e=>setWForm(p=>({...p,nome:e.target.value}))} placeholder="Prodotto" t={t} style={{gridColumn:"1/-1"}}/><LuxInput value={wForm.qty} onChange={e=>setWForm(p=>({...p,qty:e.target.value}))} type="number" placeholder="Quantità" t={t}/><LuxSelect value={wForm.unit} onChange={e=>setWForm(p=>({...p,unit:e.target.value}))} t={t}>{["kg","g","l","ml","pz"].map(u=><option key={u} value={u}>{u}</option>)}</LuxSelect><LuxSelect value={wForm.motivo} onChange={e=>setWForm(p=>({...p,motivo:e.target.value}))} t={t}>{MOTIVI.map(m=><option key={m.k} value={m.k}>{m.l}</option>)}</LuxSelect><LuxInput value={wForm.valore} onChange={e=>setWForm(p=>({...p,valore:e.target.value}))} type="number" placeholder="Valore €" t={t}/></div><Btn t={t} variant="danger" onClick={salvaWaste} disabled={!wForm.nome||!wForm.qty}>+ Registra Spreco</Btn></Card>)}
        {wasteLog.length>0&&<Card t={t} style={{padding:"12px 16px",background:"rgba(139,30,47,0.06)",border:`1px solid ${t.accent}22`}}><div style={{display:"flex",gap:20}}><div><div className="mono" style={{fontSize:7,color:t.inkFaint}}>TOTALE SPRECHI</div><div style={{fontFamily:"var(--serif)",fontSize:20,color:t.danger}}>€{totWaste.toFixed(2)}</div></div><div><div className="mono" style={{fontSize:7,color:t.inkFaint}}>EVENTI</div><div style={{fontFamily:"var(--serif)",fontSize:20,color:t.ink}}>{wasteLog.length}</div></div></div></Card>}
        {wasteLog.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:16}}>✓ Nessuno spreco registrato</div>}
        {wasteLog.map(w=>(<div key={w.id} style={{padding:"11px 16px",borderRadius:10,border:`1px solid ${t.div}`,background:t.bgCard,display:"flex",alignItems:"center",gap:12}}><div style={{flex:1}}><div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,color:t.ink}}>{w.nome}</div><div className="mono" style={{fontSize:8,color:t.inkFaint,marginTop:2}}>{w.qty} {w.unit} · {MOTIVI.find(m=>m.k===w.motivo)?.l||w.motivo} · {w.at?.slice(0,10)}</div></div>{w.valore>0&&<span className="mono" style={{fontSize:12,color:t.danger,fontWeight:600}}>−€{w.valore.toFixed(2)}</span>}<button onClick={()=>setWasteLog(p=>p.filter(x=>x.id!==w.id))} style={{...btnSmall(t),background:t.accentGlow,color:t.danger,fontSize:8}}>✕</button></div>))}
      </div>)}

      {tab==="analisi"&&(<div style={{display:"flex",flexDirection:"column",gap:16}}>
        {ricette.length===0&&wasteLog.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:16}}>Aggiungi ricette e registra sprechi per vedere le analisi</div>}
        {ricette.length>0&&(
          <Card t={t} style={{padding:20}}>
            <div className="mono" style={{fontSize:9,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:16}}>FOOD COST PER RICETTA</div>
            <>
              {[...ricette].sort((a,b)=>b.foodCostPct-a.foodCostPct).map(r=>{
                const fcc=fcColors(r.foodCostPct);
                return (
                  <div key={r.id} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink}}>{r.nome}</span>
                      <span className="mono" style={{fontSize:10,color:fcc.c}}>{r.foodCostPct.toFixed(1)}% — {fcc.l}</span>
                    </div>
                    <div style={{height:6,background:t.bgAlt,borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${Math.min(r.foodCostPct,60)/60*100}%`,background:fcc.c,borderRadius:3,transition:"width 0.8s"}}/>
                    </div>
                  </div>
                );
              })}
              <div style={{marginTop:12,padding:"10px 0",borderTop:`1px solid ${t.div}`,display:"flex",gap:12,flexWrap:"wrap"}}>
                {[
                  {l:"≤25%",  c:t.success, d:"Eccellente"},
                  {l:"25–32%",c:t.gold,    d:"Buono"},
                  {l:"32–40%",c:t.warning, d:"Alto"},
                  {l:"+40%",  c:t.danger,  d:"Critico"},
                ].map(fc=>(
                  <div key={fc.l} style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:fc.c}}/>
                    <span className="mono" style={{fontSize:8,color:t.inkFaint}}>{fc.l} {fc.d}</span>
                  </div>
                ))}
              </div>
            </>
          </Card>
        )}
      </div>)}
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════════════════════ */
// ── NAVIGAZIONE CENTRALIZZATA — zero hardcoding in JSX ──────
const MAIN_NAV = [
  {key:"dashboard",    label:"Home",    icon:"◫", mobileLabel:"Home"},
  {key:"giacenze",     label:"Stock",   icon:"❄", mobileLabel:"Stock"},
  {key:"mep",          label:"MEP",     icon:"◷", mobileLabel:"MEP"},
  {key:"preparazioni", label:"Prep",    icon:"📋", mobileLabel:"Prep"},
  {key:"servizio",     label:"Live",    icon:"▶", mobileLabel:"Live"},
];
const DRAWER_NAV = [
  {key:"spesa",      label:"Lista Spesa"},
  {key:"economato",  label:"Economato"},
  {key:"haccp",      label:"HACCP"},
  {key:"foodcost",   label:"Food Cost"},
  {key:"brigata",    label:"Brigata"},
  {key:"settings",   label:"Impostazioni"},
];
// Compatibilità: NAV usato dal sidebar esistente = unione
const NAV = [
  ...MAIN_NAV,
  ...DRAWER_NAV.map(n=>({...n,icon:"·"})),
];

const SECTION_TITLE = {
  dashboard:"Command Center",    giacenze:"Giacenze & Inventario",
  mep:"MEP — Frigo di Linea",   preparazioni:"Preparazioni",
  servizio:"Servizio Live",      spesa:"Lista della Spesa",
  economato:"Economato",         haccp:"HACCP & Tracciabilità",
  foodcost:"Food Cost & Ricette",brigata:"Brigata",
  settings:"Impostazioni",
};

export default function KitchenPro() {
  return (
    <KitchenProvider>
      <ToastProvider>
        <KitchenProInner/>
      </ToastProvider>
    </KitchenProvider>
  );
}

function KitchenProInner() {
  const [themeKey,    setThemeKey]    = useState(()=>localStorage.getItem("kp-theme")||"carta");
  const [section,     setSection]     = useState("dashboard");
  const [ready,       setReady]       = useState(false);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [showAI,      setShowAI]      = useState(false);
  const { state, kitchen } = useK();
  const t = THEMES[themeKey]||THEMES.carta;
  const alertCount = selectAlertCritici(kitchen).length;
  const [isMobile, setIsMobile] = useState(()=>typeof window!=="undefined"&&window.innerWidth<768);
  useEffect(()=>{
    const fn=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",fn,{passive:true});
    return()=>window.removeEventListener("resize",fn);
  },[]);

  useEffect(()=>{ setTimeout(()=>setReady(true),60); },[]);
  useEffect(()=>{ localStorage.setItem("kp-theme",themeKey); },[themeKey]);

  const needsSetup = state.kitchens.length===0;
  if(needsSetup) return <><style>{CSS(t)}</style><SetupScreen t={t}/></>;

  return (
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"var(--serif)",color:t.ink,background:t.bg,transition:"background 0.6s, color 0.4s"}}>
      <style>{CSS(t)}</style>

      {/* Sidebar */}
      <aside style={{
        width:sideCollapsed?68:240,background:`linear-gradient(180deg,${t.secondary},${t.secondaryDeep})`,
        display:"flex",flexDirection:"column",transition:"width 0.4s cubic-bezier(0.4,0,0.2,1)",
        position:"fixed",top:0,bottom:0,left:0,zIndex:20,
        boxShadow:`4px 0 24px ${t.shadowStrong}`,overflow:"hidden",
      }}>
        {/* Logo */}
        <div style={{padding:sideCollapsed?"20px 12px":"24px 24px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:42,height:42,minWidth:42,borderRadius:"50%",border:`2px solid ${t.goldBright}`,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.06)",boxShadow:`0 0 0 4px ${t.goldFaint}`,flexShrink:0}}>
            <span className="mono" style={{fontSize:9,color:t.goldBright,fontWeight:600}}>★★★</span>
          </div>
          {!sideCollapsed&&(
            <div style={{animation:"fadeIn 0.3s ease"}}>
              <div style={{fontSize:16,fontWeight:600,letterSpacing:"0.12em",color:"#fff",textTransform:"uppercase",whiteSpace:"nowrap"}}>
                {kitchen?.name||"Kitchen Pro"}
              </div>
              <div className="mono" style={{fontSize:7,letterSpacing:"0.2em",color:"rgba(255,255,255,0.35)",marginTop:2}}>GESTIONE CUCINA</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:"16px 10px",display:"flex",flexDirection:"column",gap:4}}>
          {NAV.map(n=>{
            const active=section===n.key;
            return (
              <button key={n.key} onClick={()=>setSection(n.key)} style={{
                display:"flex",alignItems:"center",gap:14,padding:sideCollapsed?"12px 16px":"12px 18px",
                borderRadius:10,border:"none",cursor:"pointer",
                background:active?"rgba(255,255,255,0.12)":"transparent",
                color:active?"#fff":"rgba(255,255,255,0.45)",
                fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.06em",
                transition:"all 0.25s",textAlign:"left",width:"100%",
                borderLeft:active?`3px solid ${t.goldBright}`:"3px solid transparent",
              }}>
                <span style={{fontSize:16,minWidth:20,textAlign:"center"}}>{n.icon}</span>
                {!sideCollapsed&&<span style={{whiteSpace:"nowrap"}}>{n.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Theme switcher */}
        <div style={{padding:sideCollapsed?"12px 8px 16px":"16px 14px 20px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          {!sideCollapsed&&<div className="mono" style={{fontSize:7,letterSpacing:"0.2em",color:"rgba(255,255,255,0.25)",marginBottom:10,paddingLeft:4}}>TEMA</div>}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:sideCollapsed?"center":"flex-start"}}>
            {Object.entries(THEMES).map(([key,th])=>(
              <button key={key} onClick={()=>setThemeKey(key)} title={th.name} style={{
                width:sideCollapsed?36:48,height:sideCollapsed?36:32,borderRadius:8,
                border:themeKey===key?`2px solid ${t.goldBright}`:"2px solid rgba(255,255,255,0.1)",
                background:th.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:sideCollapsed?14:12,transition:"all 0.3s",
                transform:themeKey===key?"scale(1.08)":"scale(1)",
                boxShadow:themeKey===key?`0 0 12px ${t.goldFaint}`:"none",
              }}>{th.icon}</button>
            ))}
          </div>
        </div>

        {/* Collapse */}
        <button onClick={()=>setSideCollapsed(!sideCollapsed)} style={{padding:"14px",border:"none",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:14,borderTop:"1px solid rgba(255,255,255,0.06)",transition:"all 0.25s",fontFamily:"var(--mono)"}}>
          {sideCollapsed?"→":"← Comprimi"}
        </button>
      </aside>

      {/* Main */}
      <div style={{flex:1,marginLeft:sideCollapsed?68:240,transition:"margin-left 0.4s cubic-bezier(0.4,0,0.2,1)",display:"flex",flexDirection:"column"}}>
        {/* Topbar */}
        <header style={{
          padding:"16px 36px",background:t.bgGlass,backdropFilter:"blur(20px)",
          borderBottom:`1px solid ${t.div}`,display:"flex",justifyContent:"space-between",alignItems:"center",
          position:"sticky",top:0,zIndex:10,transition:"background 0.4s",
        }}>
          <div>
            <div style={{fontSize:22,fontWeight:600,letterSpacing:"0.06em",color:t.ink}}>{SECTION_TITLE[section]}</div>
            <div className="mono" style={{fontSize:9,color:t.inkFaint,letterSpacing:"0.1em",marginTop:3}}>
              {kitchen?.name?.toUpperCase()||"—"} · {new Date().toLocaleDateString("it-IT",{weekday:"long",day:"2-digit",month:"long"})}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:18}}>
            <LiveClock t={t}/>
            <div style={{width:1,height:28,background:t.div}}/>
            <button onClick={()=>setShowAI(!showAI)} style={{
              display:"flex",alignItems:"center",gap:8,padding:"7px 18px",borderRadius:10,border:"none",cursor:"pointer",
              background:showAI?`linear-gradient(135deg,${t.gold},${t.goldBright})`:`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`,
              color:"#fff",fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.08em",
              boxShadow:`0 3px 14px ${showAI?t.goldFaint:t.shadowStrong}`,transition:"all 0.3s",
            }}>
              <span>🤖</span> AI
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{flex:1,padding:"28px 36px 48px",overflow:"auto"}} key={section}>
          <div style={{animation:ready?"cardIn 0.45s cubic-bezier(0.4,0,0.2,1) both":"none"}}>
            {section==="dashboard"    && <DashboardView t={t}/>}
            {section==="giacenze"     && <InventoryView t={t}/>}
            {section==="mep"          && <MepView t={t}/>}
            {section==="preparazioni" && <PreparazioniView t={t}/>}
            {section==="spesa"        && <SpesaView t={t}/>}
            {section==="economato"    && <EconomatoView t={t}/>}
            {section==="servizio"     && <ServizioView t={t}/>}
            {section==="haccp"        && <HaccpView t={t}/>}
            {section==="foodcost"     && <FoodCostView t={t}/>}
            {section==="brigata"      && <BrigataView t={t}/>}
            {section==="settings"     && <SettingsView t={t}/>}
          </div>
        </main>
      </div>

      {/* Bottom Nav — mobile */}
      {isMobile&&<BottomNav active={section} onChange={setSection} alertCount={alertCount} t={t}/>}
      {/* AI Panel */}
      {showAI&&<AIPanel t={t} onClose={()=>setShowAI(false)}/>}
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   BOTTOM NAV — mobile-first, da MAIN_NAV, safe area
   BOTTOM_NAV_RENDER ← marker anti-duplicato
   ════════════════════════════════════════════════════════ */
function BottomNav({ active, onChange, alertCount=0, t }) {
  return (
    <nav style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:200,
      height:"calc(56px + env(safe-area-inset-bottom,0px))",
      paddingBottom:"env(safe-area-inset-bottom,0px)",
      display:"flex", alignItems:"stretch",
      background:t.bgCard, borderTop:`1px solid ${t.div}`,
      boxShadow:`0 -4px 20px ${t.shadow}`,
    }}>
      {MAIN_NAV.map(n=>{
        const isActive = active===n.key;
        const hasAlert = n.key==="giacenze" && alertCount>0;
        return (
          <button key={n.key} onClick={()=>onChange(n.key)} style={{
            flex:1, border:"none", background:"none",
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap:3, cursor:"pointer", position:"relative",
            color:isActive?t.accent:t.inkMuted,
            minWidth:44, padding:"4px 0",
            transition:"color 0.2s",
          }}>
            {isActive&&(
              <div style={{
                position:"absolute", top:0, left:"50%",
                transform:"translateX(-50%)",
                width:28, height:2,
                background:t.accent, borderRadius:"0 0 3px 3px",
              }}/>
            )}
            <div style={{position:"relative", fontSize:20}}>
              {n.icon}
              {hasAlert&&(
                <span style={{
                  position:"absolute", top:-5, right:-8,
                  width:16, height:16, borderRadius:"50%",
                  background:t.danger, color:"#fff",
                  fontSize:9, fontFamily:"var(--mono)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>{alertCount>9?"9+":alertCount}</span>
              )}
            </div>
            <span style={{
              fontSize:9, fontFamily:"var(--mono)",
              letterSpacing:"0.04em",
              fontWeight:isActive?600:400,
            }}>{n.mobileLabel||n.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ════════════════════════════════════════════════════════
   GLOBAL CSS
   ════════════════════════════════════════════════════════ */
function CSS(t) {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@300;400;500;600&display=swap');
    :root { --serif:'Playfair Display',Georgia,serif; --mono:'JetBrains Mono',monospace; }
    *{margin:0;padding:0;box-sizing:border-box;}
    .mono{font-family:var(--mono);}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
    @keyframes cardIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
    ::-webkit-scrollbar{width:4px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:${t.goldDim};border-radius:2px;}
    input[type=date]::-webkit-calendar-picker-indicator{filter:${t.ink==="#151210"?"none":"invert(1)"};}
    /* ── MOBILE TOUCH ── */
    @media(max-width:768px){
      aside{display:none!important;}
      div[style*="marginLeft"]{margin-left:0!important;}
      header{padding:12px 16px!important;}
    }
    button,a,[role=button]{min-height:44px;min-width:44px;}
    .bottom-nav{position:fixed;bottom:0;left:0;right:0;}
    /* touch scrolling */
    *{-webkit-overflow-scrolling:touch;}
    /* no horizontal overflow */
    body,html{overflow-x:hidden;max-width:100vw;}
    /* ── SHIMMER LOADING ── */
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    .shimmer{background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.08) 50%,transparent 100%);background-size:200% 100%;animation:shimmer 1.5s ease-in-out infinite;}
    /* ── DRAG HANDLE ── */
    @media(hover:none){input,select,textarea{font-size:16px!important;}} /* prevent zoom iOS */
    /* ── BOTTOM NAV SAFE ── */
    @supports(padding-bottom:env(safe-area-inset-bottom)){.bottom-nav-wrap{padding-bottom:env(safe-area-inset-bottom);}}
    input,select{color-scheme:${t.bg.startsWith("#0")||t.bg.startsWith("#1")||t.bg.startsWith("#2")?"dark":"light"};}
  `;
}