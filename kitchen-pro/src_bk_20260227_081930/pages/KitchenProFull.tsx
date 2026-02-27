// @ts-nocheck
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
   PRODUCT CATALOG — 400+ prodotti con categoria automatica
   ════════════════════════════════════════════════════════ */
const CATALOG = [
  // PROTEINE
  {n:"Manzo fassona",c:"proteine"},{n:"Controfiletto",c:"proteine"},{n:"Filetto di manzo",c:"proteine"},
  {n:"Costata",c:"proteine"},{n:"Tartare di manzo",c:"proteine"},{n:"Ossobuco",c:"proteine"},
  {n:"Vitello",c:"proteine"},{n:"Nodino di vitello",c:"proteine"},{n:"Scaloppina",c:"proteine"},
  {n:"Piccione",c:"proteine"},{n:"Quaglia",c:"proteine"},{n:"Faraona",c:"proteine"},
  {n:"Anatra",c:"proteine"},{n:"Petto d'anatra",c:"proteine"},{n:"Confit d'anatra",c:"proteine"},
  {n:"Pollo ruspante",c:"proteine"},{n:"Petto di pollo",c:"proteine"},{n:"Coscia di pollo",c:"proteine"},
  {n:"Agnello",c:"proteine"},{n:"Costolette d'agnello",c:"proteine"},{n:"Carré d'agnello",c:"proteine"},
  {n:"Maiale",c:"proteine"},{n:"Pancetta",c:"proteine"},{n:"Guanciale",c:"proteine"},
  {n:"Lardo",c:"proteine"},{n:"Coppa",c:"proteine"},{n:"Bresaola",c:"proteine"},
  {n:"Prosciutto crudo",c:"proteine"},{n:"Prosciutto cotto",c:"proteine"},{n:"Mortadella",c:"proteine"},
  {n:"Salame",c:"proteine"},{n:"Nduja",c:"proteine"},{n:"Speck",c:"proteine"},
  {n:"Foie gras",c:"proteine"},{n:"Uova fresche",c:"proteine"},{n:"Uova di quaglia",c:"proteine"},
  // PESCE
  {n:"Branzino",c:"pesce"},{n:"Orata",c:"pesce"},{n:"Rombo",c:"pesce"},
  {n:"Sogliola",c:"pesce"},{n:"Tonno rosso",c:"pesce"},{n:"Salmone",c:"pesce"},
  {n:"Halibut",c:"pesce"},{n:"Merluzzo",c:"pesce"},{n:"Baccalà",c:"pesce"},
  {n:"Trota",c:"pesce"},{n:"Trota salmonata",c:"pesce"},{n:"Anguilla",c:"pesce"},
  {n:"Sgombro",c:"pesce"},{n:"Sardine",c:"pesce"},{n:"Acciughe",c:"pesce"},
  {n:"Polpo",c:"pesce"},{n:"Seppie",c:"pesce"},{n:"Calamari",c:"pesce"},
  {n:"Gamberi",c:"pesce"},{n:"Mazzancolle",c:"pesce"},{n:"Scampi",c:"pesce"},
  {n:"Astice",c:"pesce"},{n:"Aragosta",c:"pesce"},{n:"Granchio",c:"pesce"},
  {n:"Capesante",c:"pesce"},{n:"Cozze",c:"pesce"},{n:"Vongole",c:"pesce"},
  {n:"Ostriche",c:"pesce"},{n:"Ricci di mare",c:"pesce"},{n:"Tartufo di mare",c:"pesce"},
  {n:"Bottarga",c:"pesce"},{n:"Caviale",c:"pesce"},{n:"Uova di salmone",c:"pesce"},
  // VERDURE
  {n:"Carciofi",c:"verdure"},{n:"Asparagi verdi",c:"verdure"},{n:"Asparagi bianchi",c:"verdure"},
  {n:"Zucchine",c:"verdure"},{n:"Melanzane",c:"verdure"},{n:"Peperoni",c:"verdure"},
  {n:"Pomodori cuore di bue",c:"verdure"},{n:"Pomodori pachino",c:"verdure"},{n:"Pomodori datterini",c:"verdure"},
  {n:"Cipolla rossa",c:"verdure"},{n:"Cipolla bianca",c:"verdure"},{n:"Scalogno",c:"verdure"},
  {n:"Porro",c:"verdure"},{n:"Aglio",c:"verdure"},{n:"Aglio nero",c:"verdure"},
  {n:"Sedano",c:"verdure"},{n:"Carote",c:"verdure"},{n:"Finocchio",c:"verdure"},
  {n:"Rape",c:"verdure"},{n:"Ravanelli",c:"verdure"},{n:"Barbabietola",c:"verdure"},
  {n:"Topinambur",c:"verdure"},{n:"Pastinaca",c:"verdure"},{n:"Salsifis",c:"verdure"},
  {n:"Cavolo nero",c:"verdure"},{n:"Cavolo cappuccio",c:"verdure"},{n:"Broccoli",c:"verdure"},
  {n:"Cavolfiore",c:"verdure"},{n:"Cavoletti di Bruxelles",c:"verdure"},{n:"Pak choi",c:"verdure"},
  {n:"Spinaci",c:"verdure"},{n:"Bietola",c:"verdure"},{n:"Cicoria",c:"verdure"},
  {n:"Radicchio",c:"verdure"},{n:"Indivia",c:"verdure"},{n:"Lattuga",c:"verdure"},
  {n:"Rucola",c:"verdure"},{n:"Misticanza",c:"verdure"},{n:"Songino",c:"verdure"},
  {n:"Piselli",c:"verdure"},{n:"Fave",c:"verdure"},{n:"Fagiolini",c:"verdure"},
  {n:"Funghi porcini",c:"verdure"},{n:"Funghi champignon",c:"verdure"},{n:"Shiitake",c:"verdure"},
  {n:"Pleurotus",c:"verdure"},{n:"Tartufo nero",c:"verdure"},{n:"Tartufo bianco",c:"verdure"},
  {n:"Patate",c:"verdure"},{n:"Patate dolci",c:"verdure"},{n:"Patate viola",c:"verdure"},
  {n:"Mais",c:"verdure"},{n:"Avocado",c:"verdure"},{n:"Cetrioli",c:"verdure"},
  {n:"Zucca",c:"verdure"},{n:"Zucca butternut",c:"verdure"},{n:"Cachi",c:"verdure"},
  // ERBE & AROMI
  {n:"Basilico",c:"erbe"},{n:"Basilico rosso",c:"erbe"},{n:"Prezzemolo",c:"erbe"},
  {n:"Timo",c:"erbe"},{n:"Timo limone",c:"erbe"},{n:"Rosmarino",c:"erbe"},
  {n:"Salvia",c:"erbe"},{n:"Origano",c:"erbe"},{n:"Maggiorana",c:"erbe"},
  {n:"Erba cipollina",c:"erbe"},{n:"Dragoncello",c:"erbe"},{n:"Cerfoglio",c:"erbe"},
  {n:"Aneto",c:"erbe"},{n:"Finocchietto",c:"erbe"},{n:"Menta",c:"erbe"},
  {n:"Menta piperita",c:"erbe"},{n:"Melissa",c:"erbe"},{n:"Lavanda",c:"erbe"},
  {n:"Alloro",c:"erbe"},{n:"Verbena",c:"erbe"},{n:"Sorrel",c:"erbe"},
  {n:"Shiso verde",c:"erbe"},{n:"Shiso rosso",c:"erbe"},{n:"Kaffir lime",c:"erbe"},
  {n:"Lemongrass",c:"erbe"},{n:"Foglie di curry",c:"erbe"},{n:"Microgreens",c:"erbe"},
  // LATTICINI
  {n:"Burro",c:"dairy"},{n:"Burro chiarificato",c:"dairy"},{n:"Burro salato",c:"dairy"},
  {n:"Panna fresca",c:"dairy"},{n:"Panna acida",c:"dairy"},{n:"Crème fraîche",c:"dairy"},
  {n:"Latte intero",c:"dairy"},{n:"Latte scremato",c:"dairy"},{n:"Latte di bufala",c:"dairy"},
  {n:"Mozzarella",c:"dairy"},{n:"Mozzarella di bufala",c:"dairy"},{n:"Burrata",c:"dairy"},
  {n:"Stracciatella",c:"dairy"},{n:"Parmigiano Reggiano",c:"dairy"},{n:"Grana Padano",c:"dairy"},
  {n:"Pecorino romano",c:"dairy"},{n:"Pecorino sardo",c:"dairy"},{n:"Ricotta",c:"dairy"},
  {n:"Mascarpone",c:"dairy"},{n:"Gorgonzola",c:"dairy"},{n:"Taleggio",c:"dairy"},
  {n:"Fontina",c:"dairy"},{n:"Asiago",c:"dairy"},{n:"Montasio",c:"dairy"},
  {n:"Provolone",c:"dairy"},{n:"Scamorza",c:"dairy"},{n:"Caciocavallo",c:"dairy"},
  {n:"Yogurt greco",c:"dairy"},{n:"Kefir",c:"dairy"},{n:"Latte condensato",c:"dairy"},
  // CEREALI & PASTA
  {n:"Farina 00",c:"cereali"},{n:"Farina Manitoba",c:"cereali"},{n:"Farina integrale",c:"cereali"},
  {n:"Farina di riso",c:"cereali"},{n:"Farina di mais",c:"cereali"},{n:"Semola rimacinata",c:"cereali"},
  {n:"Riso Carnaroli",c:"cereali"},{n:"Riso Vialone Nano",c:"cereali"},{n:"Riso Arborio",c:"cereali"},
  {n:"Riso basmati",c:"cereali"},{n:"Riso venere",c:"cereali"},{n:"Riso selvaggio",c:"cereali"},
  {n:"Pasta spaghetti",c:"cereali"},{n:"Pasta rigatoni",c:"cereali"},{n:"Pasta penne",c:"cereali"},
  {n:"Pasta linguine",c:"cereali"},{n:"Pasta fettuccine",c:"cereali"},{n:"Pasta lasagne",c:"cereali"},
  {n:"Pane bianco",c:"cereali"},{n:"Pane integrale",c:"cereali"},{n:"Pane di segale",c:"cereali"},
  {n:"Pangrattato",c:"cereali"},{n:"Polenta",c:"cereali"},{n:"Quinoa",c:"cereali"},
  {n:"Farro",c:"cereali"},{n:"Orzo perlato",c:"cereali"},{n:"Avena",c:"cereali"},
  // GRASSI
  {n:"Olio EVO",c:"grassi"},{n:"Olio di semi",c:"grassi"},{n:"Olio di arachidi",c:"grassi"},
  {n:"Olio di sesamo",c:"grassi"},{n:"Olio di noci",c:"grassi"},{n:"Olio al tartufo",c:"grassi"},
  {n:"Strutto",c:"grassi"},{n:"Grasso d'anatra",c:"grassi"},{n:"Grasso di manzo",c:"grassi"},
  {n:"Maionese",c:"grassi"},{n:"Tahini",c:"grassi"},{n:"Pasta di nocciole",c:"grassi"},
  // ACIDI
  {n:"Aceto balsamico",c:"acidi"},{n:"Aceto di vino bianco",c:"acidi"},{n:"Aceto di vino rosso",c:"acidi"},
  {n:"Aceto di mele",c:"acidi"},{n:"Aceto di riso",c:"acidi"},{n:"Aceto di Jerez",c:"acidi"},
  {n:"Limoni",c:"acidi"},{n:"Lime",c:"acidi"},{n:"Pompelmo",c:"acidi"},
  {n:"Arance",c:"acidi"},{n:"Yuzu",c:"acidi"},{n:"Verjus",c:"acidi"},
  {n:"Succo di limone",c:"acidi"},{n:"Concentrato di agrumi",c:"acidi"},{n:"Pasta di yuzu",c:"acidi"},
  // SPEZIE
  {n:"Sale fino",c:"spezie"},{n:"Sale grosso",c:"spezie"},{n:"Sale Maldon",c:"spezie"},
  {n:"Sale nero",c:"spezie"},{n:"Pepe nero",c:"spezie"},{n:"Pepe bianco",c:"spezie"},
  {n:"Pepe lungo",c:"spezie"},{n:"Peperoncino",c:"spezie"},{n:"Paprika dolce",c:"spezie"},
  {n:"Paprika affumicata",c:"spezie"},{n:"Curcuma",c:"spezie"},{n:"Zafferano",c:"spezie"},
  {n:"Cannella",c:"spezie"},{n:"Noce moscata",c:"spezie"},{n:"Cardamomo",c:"spezie"},
  {n:"Cumino",c:"spezie"},{n:"Coriandolo",c:"spezie"},{n:"Anice stellato",c:"spezie"},
  {n:"Chiodi di garofano",c:"spezie"},{n:"Vaniglia",c:"spezie"},{n:"Vanillina",c:"spezie"},
  {n:"Za'atar",c:"spezie"},{n:"Ras el hanout",c:"spezie"},{n:"Curry",c:"spezie"},
  {n:"Sumac",c:"spezie"},{n:"Fenugreek",c:"spezie"},{n:"Wasabi",c:"spezie"},
  {n:"Zenzero fresco",c:"spezie"},{n:"Zenzero secco",c:"spezie"},{n:"Galangal",c:"spezie"},
  // FONDI & SALSE
  {n:"Fondo Bruno",c:"fondi"},{n:"Fondo di vitello",c:"fondi"},{n:"Fondo bianco",c:"fondi"},
  {n:"Bisque",c:"fondi"},{n:"Fumetto di pesce",c:"fondi"},{n:"Brodo di pollo",c:"fondi"},
  {n:"Brodo vegetale",c:"fondi"},{n:"Demi-glace",c:"fondi"},{n:"Glace di carne",c:"fondi"},
  {n:"Salsa olandese",c:"fondi"},{n:"Salsa bernese",c:"fondi"},{n:"Salsa vellutata",c:"fondi"},
  {n:"Salsa di soia",c:"fondi"},{n:"Miso bianco",c:"fondi"},{n:"Miso rosso",c:"fondi"},
  {n:"Pasta di pomodoro",c:"fondi"},{n:"Pomodori pelati",c:"fondi"},{n:"Concentrato pomodoro",c:"fondi"},
  // BEVERAGE
  {n:"Vino bianco cucina",c:"beverage"},{n:"Vino rosso cucina",c:"beverage"},{n:"Marsala",c:"beverage"},
  {n:"Cognac",c:"beverage"},{n:"Brandy",c:"beverage"},{n:"Porto",c:"beverage"},
  {n:"Calvados",c:"beverage"},{n:"Rum",c:"beverage"},{n:"Whisky",c:"beverage"},
  {n:"Birra chiara",c:"beverage"},{n:"Champagne",c:"beverage"},{n:"Prosecco",c:"beverage"},
  {n:"Acqua minerale",c:"beverage"},{n:"Acqua frizzante",c:"beverage"},{n:"Succo d'arancia",c:"beverage"},
  // SECCO & CONSERVE
  {n:"Zucchero semolato",c:"secco"},{n:"Zucchero di canna",c:"secco"},{n:"Zucchero a velo",c:"secco"},
  {n:"Miele",c:"secco"},{n:"Sciroppo d'acero",c:"secco"},{n:"Cacao amaro",c:"secco"},
  {n:"Cioccolato fondente",c:"secco"},{n:"Cioccolato bianco",c:"secco"},{n:"Cioccolato al latte",c:"secco"},
  {n:"Mandorle",c:"secco"},{n:"Nocciole",c:"secco"},{n:"Noci",c:"secco"},
  {n:"Pinoli",c:"secco"},{n:"Pistacchi",c:"secco"},{n:"Anacardi",c:"secco"},
  {n:"Uvetta",c:"secco"},{n:"Capperi",c:"secco"},{n:"Olive taggiasche",c:"secco"},
  {n:"Acciughe sott'olio",c:"secco"},{n:"Tonno sott'olio",c:"secco"},{n:"Fagioli borlotti",c:"secco"},
  {n:"Ceci",c:"secco"},{n:"Lenticchie",c:"secco"},{n:"Fave secche",c:"secco"},
  {n:"Gelatina fogli",c:"secco"},{n:"Agar agar",c:"secco"},{n:"Amido di mais",c:"secco"},
  {n:"Bicarbonato",c:"secco"},{n:"Lievito di birra",c:"secco"},{n:"Lievito istantaneo",c:"secco"},
  // ECONOMATO — PULIZIA
  {n:"Detersivo piatti",c:"pulizia"},{n:"Detersivo lavastoviglie",c:"pulizia"},{n:"Brillantante",c:"pulizia"},
  {n:"Sgrassatore",c:"pulizia"},{n:"Disinfettante superfici",c:"pulizia"},{n:"Candeggina",c:"pulizia"},
  {n:"Alcool isopropilico",c:"pulizia"},{n:"Detersivo pavimenti",c:"pulizia"},{n:"Lucidante acciaio",c:"pulizia"},
  {n:"Spugne",c:"pulizia"},{n:"Scotch-brite",c:"pulizia"},{n:"Straccio microfibra",c:"pulizia"},
  {n:"Guanti monouso",c:"pulizia"},{n:"Sacchi spazzatura",c:"pulizia"},{n:"Detergente mani",c:"pulizia"},
  // ECONOMATO — CARTA
  {n:"Carta forno",c:"carta"},{n:"Pellicola trasparente",c:"carta"},{n:"Alluminio",c:"carta"},
  {n:"Carta assorbente",c:"carta"},{n:"Tovaglioli carta",c:"carta"},{n:"Rotoli cucina",c:"carta"},
  {n:"Stuzzicadenti",c:"carta"},{n:"Piatti carta",c:"carta"},{n:"Bicchieri carta",c:"carta"},
  // ECONOMATO — PACKAGING
  {n:"Sacchetti sottovuoto",c:"packaging"},{n:"Contenitori GN 1/1",c:"packaging"},{n:"Contenitori GN 1/2",c:"packaging"},
  {n:"Contenitori GN 1/3",c:"packaging"},{n:"Buste frigo",c:"packaging"},{n:"Etichette HACCP",c:"packaging"},
  {n:"Barattoli vetro",c:"packaging"},{n:"Pirottini",c:"packaging"},{n:"Vassoi alluminio",c:"packaging"},
  {n:"Box consegna",c:"packaging"},{n:"Film termoretraibile",c:"packaging"},{n:"Spiedini bambù",c:"packaging"},
];

// Autocomplete helper
function useCatalogSuggest(value) {
  const v = value.trim().toLowerCase();
  if (v.length < 2) return [];
  return CATALOG
    .filter(p => p.n.toLowerCase().includes(v))
    .slice(0, 8);
}

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
  return { ledger:[], shopping:[], parByCategory:{}, freezer:[], fridge:[], dry:[], counter:[], members:[], ...k };
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
    case "PREP_ADD":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, preps:[action.item,...(k.preps||[])]})) };
    case "PREP_TOGGLE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, preps:(k.preps||[]).map(x=>x.id!==action.id?x:{...x,done:!x.done})})) };
    case "PREP_REMOVE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, preps:(k.preps||[]).filter(x=>x.id!==action.id)})) };
    case "SHOP_ADD":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, shopping:[action.item,...k.shopping]})) };
    case "SHOP_TOGGLE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, shopping:k.shopping.map(x=>x.id!==action.id?x:{...x,checked:!x.checked})})) };
    case "SHOP_REMOVE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, shopping:k.shopping.filter(x=>x.id!==action.id)})) };
    case "SHOP_CLEAR":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, shopping:k.shopping.filter(x=>!x.checked || (action.cat && x.category!==action.cat))})) };
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

      prepAdd: (name, qty, unit, priority, notes) => {
        const k=kid(); if(!k)return;
        dispatch({type:"PREP_ADD",kitchenId:k,item:{id:genId(),name,quantity:qty,unit,priority:priority||"normale",notes:(notes||"").trim()||undefined,done:false,createdAt:nowISO()}});
      },
      prepToggle: (id) => { const k=kid(); if(k)dispatch({type:"PREP_TOGGLE",kitchenId:k,id}); },
      prepRemove: (id) => { const k=kid(); if(k)dispatch({type:"PREP_REMOVE",kitchenId:k,id}); },
      shopAdd: (name, qty, unit, category, notes) => {
        const k=kid(); if(!k)return;
        const n=(name||"").trim(); const q=Number(qty);
        if(!n||!isFinite(q)||q<=0)return;
        dispatch({type:"SHOP_ADD",kitchenId:k,item:{id:genId(),name:n,quantity:q,unit,category,notes:(notes||"").trim()||undefined,checked:false,createdAt:nowISO()}});
      },
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
   UTILITY
   ════════════════════════════════════════════════════════ */
const MACRO = {
  alimenti: "🥩 Alimenti",
  economato: "🧴 Economato",
};
const CATEGORIES = {
  // ── Alimenti ──
  proteine:  { label:"Proteine",     macro:"alimenti", icon:"🥩" },
  pesce:     { label:"Pesce",        macro:"alimenti", icon:"🐟" },
  verdure:   { label:"Verdure",      macro:"alimenti", icon:"🥬" },
  erbe:      { label:"Erbe & Aromi", macro:"alimenti", icon:"🌿" },
  dairy:     { label:"Latticini",    macro:"alimenti", icon:"🧀" },
  cereali:   { label:"Cereali",      macro:"alimenti", icon:"🌾" },
  grassi:    { label:"Grassi",       macro:"alimenti", icon:"🫒" },
  acidi:     { label:"Acidi",        macro:"alimenti", icon:"🍋" },
  spezie:    { label:"Spezie",       macro:"alimenti", icon:"🌶" },
  fondi:     { label:"Fondi",        macro:"alimenti", icon:"🍲" },
  beverage:  { label:"Beverage",     macro:"alimenti", icon:"🍷" },
  secco:     { label:"Secco",        macro:"alimenti", icon:"🥫" },
  // ── Economato ──
  pulizia:   { label:"Pulizia",      macro:"economato", icon:"🧹" },
  carta:     { label:"Carta & Usa&Getta", macro:"economato", icon:"🧻" },
  divise:    { label:"Divise",       macro:"economato", icon:"👨‍🍳" },
  attrezzatura:{ label:"Attrezzatura", macro:"economato", icon:"🔧" },
  packaging: { label:"Packaging",   macro:"economato", icon:"📦" },
  ufficio:   { label:"Ufficio",      macro:"economato", icon:"📎" },
};
// helper per compatibilità vecchio codice
const catLabel = (k) => CATEGORIES[k]?.label ?? k ?? "—";
const catIcon  = (k) => CATEGORIES[k]?.icon  ?? "·";
const PAR_PRESET = {proteine:6,pesce:4,verdure:8,erbe:12,dairy:6,cereali:3,grassi:4,acidi:6,spezie:10,fondi:4,beverage:6,secco:5,pulizia:10,carta:15,divise:5,attrezzatura:3,packaging:20,ufficio:8};
const UNITS = ["pz","g","kg","ml","l","vac","busta","brik","latta","box","vasch"];

const MEP_COMUNI = [
  "Fondo bruno ridotto","Bisque di crostacei","Fumetto di pesce","Brodo di pollo chiarificato",
  "Demi-glace","Glace di carne","Salsa bernese","Salsa olandese","Beurre blanc",
  "Salsa vellutata","Maionese artigianale","Vinaigrette al limone","Olio al basilico",
  "Olio al tartufo","Burro chiarificato","Burro montato","Crema pasticcera","Crema chantilly",
  "Pasta frolla","Pasta sfoglia","Pasta choux","Brioche","Pane al vapore",
  "Tartare di manzo","Carpaccio","Gravlax di salmone","Terrina di foie gras",
  "Ravioli freschi","Gnocchi di patate","Risotto base","Polenta cremosa",
  "Julienne di verdure","Brunoise di mirepoix","Chiffonade di erbe","Chips di verdure",
  "Purea di patate","Purea di piselli","Purea di sedano rapa","Crema di zucca",
  "Gel di agrumi","Spuma di parmigiano","Aria di limone","Cialda croccante",
  "Caramello salato","Coulis di lamponi","Sorbet al limone","Ganache al cioccolato",
  "Crumble alle mandorle","Salsa al cioccolato fondente",
];
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
          <Btn t={t} onClick={()=>createKitchen(name,owner)} disabled={!name.trim()} variant="primary" style={{marginTop:8}}>
            Crea Cucina
          </Btn>
        </div>
      </Card>
    </div>
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

  return (
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      {/* KPI */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
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



/* ════ Custom memory hook ════ */
function useCustomMemory(key) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("custom-"+key)||"[]"); } catch { return []; }
  });
  const add = (val) => {
    const v = val.trim(); if(!v) return;
    setItems(prev => {
      const next = [v, ...prev.filter(x=>x!==v)].slice(0,50);
      localStorage.setItem("custom-"+key, JSON.stringify(next));
      return next;
    });
  };
  return [items, add];
}

/* ════════ AutocompleteInput ════════ */
function AutocompleteInput({ value, onChange, onSelect, placeholder, t, style = {}, customSuggestions = null }) {
  const [open, setOpen] = useState(false);
  const catalogSugg = useCatalogSuggest(value);
  const suggestions = customSuggestions !== null
    ? (value.trim().length >= 1
        ? customSuggestions.filter(s=>(s.n||s).toLowerCase().includes(value.toLowerCase())).slice(0,10)
        : customSuggestions.slice(0,10))
    : catalogSugg;

  return (
    <div style={{ position: "relative", ...style }}>
      <LuxInput
        value={value}
        onChange={e => { onChange(e); setOpen(true); }}
        placeholder={placeholder}
        t={t}
        style={{ width: "100%" }}
      />
      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 9999,
          background: t.bgCard, border: `1px solid ${t.div}`,
          borderRadius: 10, boxShadow: `0 8px 24px ${t.shadowStrong}`,
          maxHeight: 240, overflowY: "auto", marginTop: 4,
        }}>
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => { onSelect(typeof s==="string"?{n:s}:s); setOpen(false); }}
              style={{
                padding: "10px 14px", cursor: "pointer", fontSize: 13,
                fontFamily: "var(--serif)", fontStyle: "italic",
                color: t.ink, borderBottom: `1px solid ${t.div}`,
                display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = t.bgAlt}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 10, color: t.inkFaint }}>{catIcon(s.c)}</span>
              {typeof s==="string"?s:s.n}
              {typeof s!=="string"&&s.c&&<span style={{ marginLeft: "auto", fontSize: 9, color: t.inkFaint, fontFamily: "var(--mono)" }}>
                {catLabel(s.c)}
              </span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ════ ExpiryQuickPicker ════ */
function ExpiryQuickPicker({ value, onChange, t }) {
  const DAYS = [3,5,7,10,14,21];
  function addDays(d) {
    const dt = new Date();
    dt.setDate(dt.getDate()+d);
    onChange(dt.toISOString().slice(0,10));
  }
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {DAYS.map(d=>(
          <button key={d} onClick={()=>addDays(d)} style={{
            padding:"4px 10px",borderRadius:8,border:`1px solid ${t.div}`,
            background:t.bgAlt,color:t.inkMuted,cursor:"pointer",
            fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.06em",
            transition:"all 0.15s",
          }}
          onMouseEnter={e=>e.currentTarget.style.background=t.gold}
          onMouseLeave={e=>e.currentTarget.style.background=t.bgAlt}
          >+{d}g</button>
        ))}
      </div>
      <input type="date" value={value} onChange={e=>onChange(e.target.value)}
        style={{background:t.bgAlt,border:`1px solid ${t.div}`,borderRadius:8,
          padding:"8px 12px",color:t.ink,fontFamily:"var(--mono)",fontSize:11,width:"100%"}}/>
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
  const [macroFilter, setMacroFilter] = useState("tutti");

  // Form state
  const [fName,     setFName]     = useState("");
  const [fQty,      setFQty]      = useState("1");
  const [fUnit,     setFUnit]     = useState("pz");
  const [fCat,      setFCat]      = useState("proteine");
  const [fLot,      setFLot]      = useState("");
  const [fExpiry,   setFExpiry]   = useState(()=>{const d=new Date();d.setDate(d.getDate()+7);return d.toISOString().slice(0,10);});
  const [fNotes,    setFNotes]    = useState("");
  const [fPar,      setFPar]      = useState("3");
  const [customNames, addCustomName] = useCustomMemory("inventory-names");

  useSpeech(r=>setFName(r));

  const LOCS = [
    {key:"fridge",   label:"Frigo",       icon:"❄️", temp:"2-4°C"},
    {key:"freezer",  label:"Congelatore", icon:"🧊", temp:"-18°C"},
    {key:"dry",      label:"Dispensa",    icon:"🏺", temp:"Ambiente"},
    {key:"counter",  label:"Banco",       icon:"🍽️", temp:"Servizio"},
  ];

  const items = ((kitchen||{})[loc]||[]).filter(item=>{
    if(macroFilter!=="tutti" && CATEGORIES[item.category]?.macro!==macroFilter) return false;
    if(!search) return true;
    return item.name.toLowerCase().includes(search.toLowerCase()) || (item.lot||"").toLowerCase().includes(search.toLowerCase());
  });

  function submitStock() {
    const qty=parseFloat(fQty);
    if(!fName.trim()||!isFinite(qty)||qty<=0) { toast("Compila nome e quantità","error"); return; }
    addCustomName(fName);
    const parVal = parseFloat(fPar)||3;
    stockAdd({
      name:fName,quantity:qty,unit:fUnit,location:loc,category:fCat,
      lot:fLot||undefined,expiresAt:fExpiry?new Date(fExpiry).toISOString():undefined,
      notes:fNotes||undefined,insertedDate:todayDate(),parLevel:parVal,
    });
    toast(`${fName} aggiunto/a`,"success");
    const d=new Date();d.setDate(d.getDate()+7);
    setFName(""); setFQty("1"); setFLot(""); setFExpiry(d.toISOString().slice(0,10)); setFNotes(""); setFPar("3");
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

      {/* Macro filter */}
      <div style={{display:"flex",gap:8}}>
        {[{k:"tutti",l:"Tutti"},...Object.entries(MACRO).map(([k,v])=>({k,l:v}))].map(({k,l})=>(
          <button key={k} onClick={()=>setMacroFilter(k)} style={{
            padding:"6px 16px",borderRadius:20,border:"none",cursor:"pointer",
            fontSize:11,fontFamily:"var(--mono)",letterSpacing:"0.06em",
            background:macroFilter===k?t.accent:t.bgCard,
            color:macroFilter===k?"#fff":t.inkMuted,
            boxShadow:`0 1px 4px ${t.shadow}`,transition:"all 0.2s",
          }}>{l}</button>
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
              <AutocompleteInput value={fName}
                onChange={e=>setFName(e.target.value)}
                onSelect={s=>{setFName(s.n);setFCat(s.c);}}
                placeholder="Nome prodotto…"
                t={t} style={{flex:1}}/>
              <VoiceBtn t={t} onResult={r=>setFName(r)}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <LuxInput value={fQty} onChange={e=>setFQty(e.target.value)} type="number" placeholder="Qtà" t={t}/>
              <LuxSelect value={fUnit} onChange={e=>setFUnit(e.target.value)} t={t}>
                {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </LuxSelect>
            </div>
            <LuxSelect value={fCat} onChange={e=>setFCat(e.target.value)} t={t}>
              {Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
            </LuxSelect>
            <LuxInput value={fLot} onChange={e=>setFLot(e.target.value)} placeholder="Lotto (HACCP)" t={t}/>
            <div>
              <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:4}}>SCADENZA</div>
              <ExpiryQuickPicker value={fExpiry} onChange={setFExpiry} t={t}/>
            </div>
            <div>
              <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:4}}>PAR MINIMO (allerta sotto)</div>
              <LuxInput value={fPar} onChange={e=>setFPar(e.target.value)} type="number" placeholder="Min (default 3)" t={t}/>
            </div>
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
                        {catLabel(item.category)}
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
  const [customMep, addCustomMep] = useCustomMemory("mep-names");
  const mepSuggestions = useMemo(()=>[...new Set([...customMep,...MEP_COMUNI])],[customMep]);
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

  // ── Task helpers ──────────────────────────────────────
  function addTask(text, station) {
    const tx = text.trim(); if (!tx) return;
    setTasks(p => [...p, { id:genId(), text:tx, station:station||"all", done:false, createdAt:nowISO() }]);
  }
  function toggleTask(id) { setTasks(p => p.map(x => x.id !== id ? x : {...x, done:!x.done})); }
  function removeTask(id) { setTasks(p => p.filter(x => x.id !== id)); }

  function doManualAdd() {
    if (!manualText.trim()) { toast("Scrivi la preparazione","error"); return; }
    addCustomMep(manualText);
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
   PREPARAZIONI VIEW
   ════════════════════════════════════════════════════════ */
function PreparazioniView({ t }) {
  const { kitchen, prepAdd, prepToggle, prepRemove, currentRole } = useK();
  const toast = useToast();
  const canEdit = CAN_EDIT.includes(currentRole());
  const [name, setName] = useState("");
  const [qty,  setQty]  = useState("1");
  const [unit, setUnit] = useState("pz");
  const [prio, setPrio] = useState("normale");
  const [notes,setNotes]= useState("");
  const [tab,  setTab]  = useState("lista"); // lista | agenda
  const [customPrep, addCustomPrep] = useCustomMemory("prep-names");
  const prepSuggestions = useMemo(()=>[...new Set([...customPrep,...MEP_COMUNI])],[customPrep]);
  useSpeech(r=>setName(r));

  const PRIOS = [
    {k:"urgente",  l:"🔴 Urgente",  col:"#8B1E2F"},
    {k:"alta",     l:"🟠 Alta",     col:"#C19A3E"},
    {k:"normale",  l:"🟢 Normale",  col:"#3D7A4A"},
    {k:"bassa",    l:"⚪ Bassa",    col:"#7A7168"},
  ];

  const preps = (kitchen?.preps||[]);
  const todo  = preps.filter(x=>!x.done);
  const done  = preps.filter(x=>x.done);

  function add() {
    if(!name.trim()) { toast("Inserisci il nome della preparazione","error"); return; }
    addCustomPrep(name.trim());
    prepAdd(name.trim(), parseFloat(qty)||1, unit, prio, notes);
    toast(`${name} aggiunto alle preparazioni`,"success");
    setName(""); setQty("1"); setNotes("");
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Tab switcher */}
      <div style={{display:"flex",gap:8}}>
        {[{k:"lista",l:"📋 Lista"},{ k:"agenda",l:"📅 Agenda"}].map(({k,l})=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:"8px 20px",borderRadius:10,border:"none",cursor:"pointer",
            fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.08em",
            background:tab===k?`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`:t.bgCard,
            color:tab===k?"#fff":t.inkMuted,
            boxShadow:`0 1px 4px ${t.shadow}`,transition:"all 0.2s",
          }}>{l}</button>
        ))}
      </div>

      {tab==="agenda"&&<PrepAgenda t={t} preps={preps} prepToggle={prepToggle}/>}
      {tab==="lista"&&canEdit&&(
        <Card t={t} style={{padding:20}}>
          <div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:12}}>NUOVA PREPARAZIONE</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div style={{display:"flex",gap:8,gridColumn:"1/-1"}}>
              <AutocompleteInput value={name} onChange={e=>setName(e.target.value)} onSelect={s=>{setName(typeof s==="string"?s:s.n);}} placeholder="Nome preparazione… (50 comuni)" t={t} style={{flex:1}} customSuggestions={prepSuggestions}/>
              <VoiceBtn t={t} onResult={r=>setName(r)}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <LuxInput value={qty} onChange={e=>setQty(e.target.value)} type="number" placeholder="Qtà" t={t}/>
              <LuxSelect value={unit} onChange={e=>setUnit(e.target.value)} t={t}>
                {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </LuxSelect>
            </div>
            <LuxSelect value={prio} onChange={e=>setPrio(e.target.value)} t={t}>
              {PRIOS.map(p=><option key={p.k} value={p.k}>{p.l}</option>)}
            </LuxSelect>
            <LuxInput value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Note / tecnica" t={t} style={{gridColumn:"1/-1"}}/>
          </div>
          <Btn t={t} variant="gold" onClick={add} disabled={!name.trim()}>+ Aggiungi preparazione</Btn>
        </Card>
      )}

      {/* Lista TO-DO per priorità */}
      {tab==="lista"&&PRIOS.map(p=>{
        const pItems = todo.filter(x=>x.priority===p.k);
        if(!pItems.length) return null;
        return (
          <Card key={p.k} t={t}>
            <div style={{padding:"14px 22px 8px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:p.col,flexShrink:0}}/>
              <span className="mono" style={{fontSize:9,letterSpacing:"0.14em",color:t.ink}}>{p.l.split(" ")[1].toUpperCase()}</span>
              <span style={{marginLeft:"auto",background:t.bgAlt,borderRadius:10,padding:"2px 8px",fontSize:9,color:t.inkFaint}}>{pItems.length}</span>
            </div>
            {pItems.map((item,i)=>(
              <div key={item.id} style={{padding:"12px 22px",display:"flex",alignItems:"center",gap:12,borderTop:`1px solid ${t.div}`}}>
                <input type="checkbox" checked={item.done} onChange={()=>prepToggle(item.id)} style={{cursor:"pointer",accentColor:t.gold,width:16,height:16}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontFamily:"var(--serif)",fontStyle:"italic",color:t.ink}}>{item.name}</div>
                  <div className="mono" style={{fontSize:9,color:t.inkFaint,marginTop:2}}>
                    {item.quantity} {item.unit}
                    {item.notes&&` · ${item.notes}`}
                    {` · ${fmtDate(item.createdAt)}`}
                  </div>
                </div>
                {canEdit&&<button onClick={()=>prepRemove(item.id)} style={{...btnSmall(t),color:t.danger}}>✕</button>}
              </div>
            ))}
          </Card>
        );
      })}

      {/* Completate */}
      {tab==="lista"&&done.length>0&&(
        <Card t={t}>
          <CardHeader t={t} title={`COMPLETATE (${done.length})`} right={
            <button onClick={()=>done.forEach(x=>prepRemove(x.id))} style={{...btnSmall(t),fontSize:8}}>Pulisci</button>
          }/>
          {done.map(item=>(
            <div key={item.id} style={{padding:"10px 22px",display:"flex",alignItems:"center",gap:12,borderTop:`1px solid ${t.div}`,opacity:0.5}}>
              <input type="checkbox" checked={true} onChange={()=>prepToggle(item.id)} style={{cursor:"pointer",accentColor:t.gold}}/>
              <span style={{fontSize:12,fontFamily:"var(--serif)",fontStyle:"italic",textDecoration:"line-through",color:t.inkMuted}}>{item.name}</span>
              <span className="mono" style={{fontSize:9,color:t.inkFaint,marginLeft:"auto"}}>{item.quantity} {item.unit}</span>
            </div>
          ))}
        </Card>
      )}

      {tab==="lista"&&preps.length===0&&(
        <div style={{textAlign:"center",padding:"48px 0",color:t.inkFaint}}>
          <div style={{fontFamily:"var(--serif)",fontSize:20,fontStyle:"italic",marginBottom:8}}>Nessuna preparazione</div>
          <div className="mono" style={{fontSize:9,letterSpacing:"0.14em"}}>AGGIUNGI LE PREP DEL GIORNO</div>
        </div>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   PREP AGENDA — calendario con giorni autonomia
   ════════════════════════════════════════════════════════ */
function PrepAgenda({ t, preps, prepToggle }) {
  const [autonomia, setAutonomia] = useState({}); // prepId → giorni
  const [view, setView] = useState("agenda"); // agenda | config

  const today = new Date();
  const days = Array.from({length:14},(_,i)=>{
    const d = new Date(today);
    d.setDate(today.getDate()+i);
    return d;
  });

  function getPrepsForDay(day) {
    return preps.filter(p=>{
      if(p.done) return false;
      const aut = autonomia[p.id]||1;
      const created = new Date(p.createdAt);
      const deadline = new Date(created);
      deadline.setDate(created.getDate()+aut);
      return deadline.toDateString()===day.toDateString() ||
             (day>=created && day<=deadline);
    });
  }

  const fmtDay = d => d.toLocaleDateString("it-IT",{weekday:"short",day:"numeric",month:"short"});

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Header */}
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div className="mono" style={{fontSize:9,letterSpacing:"0.14em",color:t.inkFaint,flex:1}}>AGENDA PREPARAZIONI — 14 GIORNI</div>
        <button onClick={()=>setView(v=>v==="agenda"?"config":"agenda")} style={{
          padding:"6px 14px",borderRadius:8,border:`1px solid ${t.div}`,
          background:t.bgCard,color:t.inkMuted,cursor:"pointer",fontFamily:"var(--mono)",fontSize:9
        }}>⚙ Autonomia</button>
      </div>

      {/* Config autonomia */}
      {view==="config"&&(
        <Card t={t} style={{padding:16}}>
          <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:10}}>GIORNI DI AUTONOMIA PER PREPARAZIONE</div>
          {preps.filter(p=>!p.done).map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${t.div}`}}>
              <span style={{flex:1,fontSize:12,fontFamily:"var(--serif)",fontStyle:"italic",color:t.ink}}>{p.name}</span>
              <div style={{display:"flex",gap:4}}>
                {[1,2,3,5,7,10,14].map(d=>(
                  <button key={d} onClick={()=>setAutonomia(prev=>({...prev,[p.id]:d}))} style={{
                    padding:"4px 8px",borderRadius:6,border:"none",cursor:"pointer",
                    fontFamily:"var(--mono)",fontSize:9,
                    background:(autonomia[p.id]||1)===d?t.accent:t.bgAlt,
                    color:(autonomia[p.id]||1)===d?"#fff":t.inkMuted,
                    transition:"all 0.15s",
                  }}>{d}g</button>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Calendario */}
      {view==="agenda"&&days.map(day=>{
        const dayPreps = getPrepsForDay(day);
        const isToday = day.toDateString()===today.toDateString();
        return (
          <div key={day.toDateString()} style={{
            borderRadius:12,overflow:"hidden",
            border:`1px solid ${isToday?t.accent:t.div}`,
            boxShadow:isToday?`0 4px 20px ${t.accentGlow}`:`0 1px 4px ${t.shadow}`,
          }}>
            <div style={{
              padding:"10px 16px",
              background:isToday?`linear-gradient(135deg,${t.accent},${t.accentDeep})`:`linear-gradient(135deg,${t.bgAlt},${t.bgCard})`,
              display:"flex",alignItems:"center",justifyContent:"space-between",
            }}>
              <span style={{fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.1em",color:isToday?"#fff":t.ink}}>
                {isToday?"OGGI · ":""}{fmtDay(day).toUpperCase()}
              </span>
              <span style={{
                background:isToday?"rgba(255,255,255,0.2)":t.div,
                borderRadius:10,padding:"2px 8px",fontSize:9,
                color:isToday?"#fff":t.inkFaint,fontFamily:"var(--mono)"
              }}>{dayPreps.length} prep</span>
            </div>
            {dayPreps.length===0?(
              <div style={{padding:"12px 16px",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12}}>Nessuna preparazione</div>
            ):(
              dayPreps.map(p=>(
                <div key={p.id} style={{padding:"10px 16px",display:"flex",alignItems:"center",gap:10,borderTop:`1px solid ${t.div}`}}>
                  <input type="checkbox" checked={p.done} onChange={()=>prepToggle(p.id)} style={{accentColor:t.gold,cursor:"pointer"}}/>
                  <span style={{flex:1,fontSize:12,fontFamily:"var(--serif)",fontStyle:"italic",color:t.ink}}>{p.name}</span>
                  <span className="mono" style={{fontSize:9,color:t.inkFaint}}>{p.quantity} {p.unit}</span>
                  <span style={{fontSize:9,padding:"2px 6px",borderRadius:6,background:t.goldFaint,color:t.gold,fontFamily:"var(--mono)"}}>
                    {autonomia[p.id]||1}g autonomia
                  </span>
                </div>
              ))
            )}
          </div>
        );
      })}
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
  const [cat,  setCat]   = useState("giornaliero");
  const [notes,setNotes] = useState("");
  useSpeech(r=>setName(r));

  const SHOP_CATS = [
    {k:"giornaliero", l:"📅 Giornaliero", col:"#3D7A4A"},
    {k:"settimanale",  l:"📆 Settimanale",  col:"#182040"},
    {k:"alimenti",     l:"🥩 Alimenti",     col:"#8B1E2F"},
    {k:"economato",    l:"🧴 Economato",    col:"#C19A3E"},
    {k:"altro",        l:"📦 Altro",        col:"#7A7168"},
  ];
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
              <AutocompleteInput value={name} onChange={e=>setName(e.target.value)} onSelect={s=>{setName(s.n);setCat(CATEGORIES[s.c]?.macro==="economato"?"economato":"giornaliero");}} placeholder="Articolo…" t={t} style={{flex:1}}/>
              <VoiceBtn t={t} onResult={r=>setName(r)}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <LuxInput value={qty} onChange={e=>setQty(e.target.value)} type="number" placeholder="Qtà" t={t}/>
              <LuxSelect value={unit} onChange={e=>setUnit(e.target.value)} t={t}>
                {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </LuxSelect>
            </div>
            <LuxSelect value={cat} onChange={e=>setCat(e.target.value)} t={t}>
              {SHOP_CATS.map(c=><option key={c.k} value={c.k}>{c.l}</option>)}
            </LuxSelect>
            <LuxInput value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Note" t={t}/>
          </div>
          <Btn t={t} onClick={add} disabled={!name.trim()}>Aggiungi alla lista</Btn>
        </Card>
      )}

      {SHOP_CATS.map(({k:category,l:catLabel2,col})=>{
        const catItems = items.filter(x=>x.category===category);
        if(!catItems.length) return null;
        const unchecked = catItems.filter(x=>!x.checked);
        const checked   = catItems.filter(x=>x.checked);
        return (
          <Card key={category} t={t}>
            <CardHeader t={t} title={catLabel2}
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
                  <div className="mono" style={{fontSize:8,letterSpacing:"0.12em",color:t.inkFaint,marginBottom:4}}>{catLabel(key).toUpperCase()}</div>
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
  const { allItems, stockAdd, removeItem, shopAdd, prepAdd, kitchen } = useK();
  const [messages, setMessages] = useState([{role:"ai",text:"Ciao! Sono il tuo assistente cucina. Posso aiutarti con le giacenze, scadenze, e liste. Cosa vuoi sapere?"}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

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

    // ── SMART ROUTER: smista testo libero in giacenza/spesa/prep ──────────────
    if(/^smista:|^router:|carica tutto|analizza e smista/.test(lower)) {
      const testo = msg.replace(/^smista:|^router:|carica tutto|analizza e smista/i,"").trim();
      setLoading(true);
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            model:"claude-sonnet-4-20250514", max_tokens:800,
            system:`Sei un assistente cucina Michelin. Analizza il testo e classifica ogni voce in JSON array:
[{"dest":"giacenza"|"spesa"|"prep", "name":"...", "qty":1, "unit":"pz"|"kg"|"g"|"ml"|"l", "location":"fridge"|"freezer"|"dry"|"counter", "category":"proteine"|"pesce"|"verdure"|"erbe"|"dairy"|"cereali"|"grassi"|"acidi"|"spezie"|"fondi"|"beverage"|"secco"|"pulizia"|"carta"|"packaging", "notes":"...opzionale"}]
Regole: giacenza=prodotto già in cucina, spesa=da comprare, prep=preparazione da fare. Rispondi SOLO con il JSON array, niente altro.`,
            messages:[{role:"user",content:testo}],
          }),
        });
        const data = await res.json();
        const raw  = data.content?.map(b=>b.text||"").join("")||"[]";
        const clean = raw.replace(/```json|```/g,"").trim();
        const items = JSON.parse(clean);
        let giacCount=0, spesaCount=0, prepCount=0;
        for(const it of items) {
          if(it.dest==="giacenza") {
            stockAdd({name:it.name,quantity:it.qty||1,unit:it.unit||"pz",location:it.location||"fridge",category:it.category||"secco"});
            giacCount++;
          } else if(it.dest==="spesa") {
            shopAdd(it.name,it.qty||1,it.unit||"pz",it.category||"giornaliero",it.notes);
            spesaCount++;
          } else if(it.dest==="prep") {
            prepAdd(it.name,it.qty||1,it.unit||"pz","normale",it.notes);
            prepCount++;
          }
        }
        reply=`✅ Smistato:
🏪 ${giacCount} in giacenza
🛒 ${spesaCount} in lista spesa
📋 ${prepCount} in preparazioni`;
      } catch(e) { reply="Errore smistamento. Riprova."; }
      finally { setLoading(false); }
      setMessages(p=>[...p,{role:"ai",text:reply}]); return;
    }

    // ── Intent: aggiungi multipli in spesa con AI ───────────────────────────
    if(/aggiungi.*spesa|metti.*lista|ordina/.test(lower)&&lower.split(",").length>1) {
      const voci = msg.split(/[,;\n]+/).map(s=>s.replace(/aggiungi|metti|ordina/i,"").trim()).filter(Boolean);
      voci.forEach(v=>{
        const m=v.match(/^([\d.,]+)?\s*(kg|g|ml|l|pz)?\s+(.+)$/i);
        const name=m?m[3].trim():v;
        const qty=m&&m[1]?parseFloat(m[1].replace(",",".")):1;
        const unit=m&&m[2]?m[2]:"pz";
        shopAdd(name,qty,unit,"giornaliero","");
      });
      reply=`🛒 ${voci.length} articoli aggiunti alla lista spesa.`;
    }
    // ── Intent: aggiungi multipli in prep ──────────────────────────────────
    else if(/prepara|prep |mise en place/.test(lower)&&lower.split(",").length>1) {
      const voci = msg.split(/[,;\n]+/).map(s=>s.replace(/prepara|mise en place/i,"").trim()).filter(Boolean);
      voci.forEach(v=>prepAdd(v.trim(),1,"pz","normale",""));
      reply=`📋 ${voci.length} preparazioni aggiunte.`;
    }
    // ── Intent: lista spesa
    else if(/spesa|lista spesa|comprare|ordina/.test(lower)) {
      const shopItems=(kitchen?.shopping||[]).filter(x=>!x.checked);
      if(!shopItems.length) reply="✓ Lista spesa vuota.";
      else reply="📋 Lista spesa:\n"+shopItems.map(x=>`· ${x.name} ${x.quantity} ${x.unit}`).join("\n");
    }
    // ── Intent: conversione unità
    else if(/converti|converte|quant.*in\s+(kg|g|l|ml)/.test(lower)) {
      const m=lower.match(/([\d.,]+)\s*(kg|g|l|ml)\s+in\s+(kg|g|l|ml)/);
      if(m){
        const val=parseFloat(m[1].replace(",",".")),from=m[2],to=m[3];
        const toG={kg:1000,g:1,l:1000,ml:1};
        const result=(val*toG[from]/toG[to]);
        reply=`${val}${from} = ${result}${to}`;
      }
    }
    // ── Intent: economato
    else if(/economato|detersiv|pulizia|divisa|packaging/.test(lower)) {
      const econItems=items.filter(x=>CATEGORIES[x.category]?.macro==="economato");
      if(!econItems.length) reply="Nessun articolo economato in magazzino.";
      else reply="🧴 Economato:\n"+econItems.map(x=>`· ${x.name}: ${x.quantity} ${x.unit}`).join("\n");
    }
    // ── Intent: scadenze
    else if(/scadenz|urgenti|in scadenza/.test(lower)) {
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
          <div className="mono" style={{fontSize:7,color:"rgba(255,255,255,0.5)",letterSpacing:"0.14em",marginTop:1}}>Scrivi "smista: [testo]" per auto-classificare</div>
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
   MAIN APP
   ════════════════════════════════════════════════════════ */
const NAV = [
  {key:"dashboard",  label:"Dashboard",    icon:"◫"},
  {key:"giacenze",   label:"Giacenze",      icon:"❄"},
  {key:"mep",        label:"MEP",           icon:"◷"},
  {key:"preparazioni", label:"Prep",        icon:"📋"},
  {key:"spesa",      label:"Spesa",         icon:"◻"},
  {key:"brigata",    label:"Brigata",       icon:"★"},
  {key:"settings",   label:"Impostazioni",  icon:"⊞"},
];

const SECTION_TITLE = {
  dashboard:"Command Center",giacenze:"Giacenze & Inventario",mep:"Organizzazione MEP",
  spesa:"Lista della Spesa",brigata:"Brigata",settings:"Impostazioni",
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
  const t = THEMES[themeKey]||THEMES.carta;
  const { state, kitchen } = useK();

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
            {section==="dashboard"  && <DashboardView t={t}/>}
            {section==="giacenze"   && <InventoryView t={t}/>}
      {section==="preparazioni" && <PreparazioniView t={t}/>}
            {section==="mep"        && <MepView t={t}/>}
            {section==="spesa"      && <ShoppingView t={t}/>}
            {section==="brigata"    && <BrigataView t={t}/>}
            {section==="settings"   && <SettingsView t={t}/>}
          </div>
        </main>
      </div>

      {/* AI Panel */}
      {showAI&&<AIPanel t={t} onClose={()=>setShowAI(false)}/>}
    </div>
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
    input,select{color-scheme:${t.bg.startsWith("#0")||t.bg.startsWith("#1")||t.bg.startsWith("#2")?"dark":"light"};}
  `;
}