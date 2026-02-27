// @ts-nocheck
import React, {
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




/* ════ useIsMobile — JS-based, non dipende da CSS media queries ════ */
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

/* ════════════════════════════════════════════════════════
   callAI — pattern unificato Anthropic (usato da tutti i componenti)
   ════════════════════════════════════════════════════════ */
/* ════ callAI — robusto: retry + timeout + cache + error handling ════ */
const _aiCache = new Map();

async function callAI({ systemPrompt, userContext, maxTokens=1024, expectJSON=false, cache=false, retries=2 }) {
  // Cache key basata su prompt + contesto (evita chiamate duplicate)
  const cacheKey = cache ? `${systemPrompt.slice(0,80)}_${JSON.stringify(userContext).slice(0,120)}` : null;
  if (cacheKey && _aiCache.has(cacheKey)) return _aiCache.get(cacheKey);

  const body = JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: typeof userContext === "string" ? userContext : JSON.stringify(userContext) }],
  });

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.status === 429) { // rate limit
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        continue;
      }
      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const result = expectJSON ? JSON.parse(text.replace(/```json|```/g, "").trim()) : text;

      if (cacheKey) _aiCache.set(cacheKey, result);
      return result;
    } catch(e) {
      lastErr = e;
      if (e.name === "AbortError") throw new Error("Timeout: l'AI ha impiegato troppo. Riprova.");
      if (attempt < retries) await new Promise(r => setTimeout(r, 800 * Math.pow(2, attempt)));
    }
  }
  throw lastErr || new Error("Errore AI");
}

/* ════ AI_PROMPTS — 6 template reparto ════ */
const AI_PROMPTS = {
  cucina_calda: { label:"Cucina Calda",    icon:"🔥", system:"Sei uno chef saucier Michelin 3 stelle. Focus: stagionalità, batch proteico, zero waste. Rispondi SOLO JSON valido." },
  pesce:        { label:"Pesce & Pescato", icon:"🐟", system:"Sei uno chef poissonnier Michelin. Focus: freschezza, mercato del giorno, provenienza certificata. Rispondi SOLO JSON valido." },
  verdura:      { label:"Verdura & Orto",  icon:"🥬", system:"Sei responsabile acquisti verdura per cucina Michelin. Focus: stagionalità, km0, zero waste. Rispondi SOLO JSON valido." },
  pasticceria:  { label:"Pasticceria",     icon:"🍮", system:"Sei pastry chef executive Michelin. Focus: precisione grammatale, shelf-life, ingredienti tecnici. Rispondi SOLO JSON valido." },
  cantina:      { label:"Cantina",         icon:"🍷", system:"Sei sommelier e responsabile cantina Michelin. Focus: abbinamenti, rotazione, champagne e bollicine. Rispondi SOLO JSON valido." },
  economato:    { label:"Economato",       icon:"🧴", system:"Sei responsabile economato cucina professionale. Focus: costi non-food, HACCP, consumabili. Rispondi SOLO JSON valido." },
};

/* ════ Kanban costanti ════ */
const KANBAN_COLS = [
  {key:"da_fare",  label:"Da Fare",  icon:"📋", color:"#7A7168"},
  {key:"in_corso", label:"In Corso", icon:"⚡", color:"#C19A3E"},
  {key:"pronta",   label:"Pronta",   icon:"✅", color:"#3D7A4A"},
  {key:"smistata", label:"Smistata", icon:"📦", color:"#182040"},
];
const DEST_OPTS = [
  {key:"frigo",       label:"Frigo",        icon:"❄️", color:"#2A4FA5"},
  {key:"congelatore", label:"Congelatore",  icon:"🧊", color:"#1A3A6A"},
  {key:"mep",         label:"MEP Servizio", icon:"🍽️", color:"#8B1E2F"},
  {key:"banco",       label:"Banco",        icon:"🔲", color:"#555"},
];
const REPARTI = [
  {k:"cucina_calda", l:"🔥 Cucina Calda"},
  {k:"pesce",        l:"🐟 Pesce"},
  {k:"pasticceria",  l:"🍮 Pasticceria"},
  {k:"garde_manger", l:"🥗 Garde Manger"},
  {k:"tutti",        l:"⭐ Tutti"},
];
const TURNI = [
  {k:"mattina",    l:"🌅 Mattina"},
  {k:"pomeriggio", l:"☀️ Pomeriggio"},
  {k:"sera",       l:"🌙 Sera"},
  {k:"tutti",      l:"⭐ Tutti"},
];

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
    case "PREP_UPDATE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, preps:(k.preps||[]).map(x=>x.id!==action.id?x:{...x,...action.patch})})) };
    case "PREP_MOVE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, preps:(k.preps||[]).map(x=>x.id!==action.id?x:{...x,destination:action.destination,routedAt:nowISO()})})) };
    case "WASTE_LOG":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, wasteLog:[action.entry,...(k.wasteLog||[])]})) };
    case "TEMP_RECORD":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, tempLogs:[action.entry,...(k.tempLogs||[])]})) };
    case "LOT_ADD":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, lots:[action.lot,...(k.lots||[])]})) };
    case "RECIPE_ADD":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, recipes:[action.recipe,...(k.recipes||[])]})) };
    case "RECIPE_UPDATE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, recipes:(k.recipes||[]).map(r=>r.id!==action.id?r:{...r,...action.patch})})) };
    case "RECIPE_DELETE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, recipes:(k.recipes||[]).filter(r=>r.id!==action.id)})) };
    case "SERVICE_START":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, service:{active:true,startedAt:nowISO(),covers:action.covers,notes:action.notes}})) };
    case "SERVICE_END":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, service:{...k.service,active:false,endedAt:nowISO()}})) };
    case "SERVICE_TICKET":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, tickets:[action.ticket,...(k.tickets||[])]})) };
    case "TICKET_UPDATE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, tickets:(k.tickets||[]).map(x=>x.id!==action.id?x:{...x,...action.patch})})) };
    case "MEP_ROUTE":
      return { ...state, kitchens: mapK(action.kitchenId, k => ({...k, tasks:(k.tasks||[]).map(x=>x.id!==action.id?x:{...x,destination:action.destination,routedAt:nowISO()})})) };
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
      prepUpdate: (id, patch) => { const k=kid(); if(k)dispatch({type:"PREP_UPDATE",kitchenId:k,id,patch}); },
      prepMove:   (id, dest)  => { const k=kid(); if(k)dispatch({type:"PREP_MOVE",kitchenId:k,id,destination:dest}); },
      logWaste:     (entry)   => { const k=kid(); if(k)dispatch({type:"WASTE_LOG",kitchenId:k,entry:{...entry,id:genId(),at:nowISO()}}); },
      recordTemp:   (entry)   => { const k=kid(); if(k)dispatch({type:"TEMP_RECORD",kitchenId:k,entry:{...entry,id:genId(),recordedAt:nowISO()}}); },
      addLot:       (lot)     => { const k=kid(); if(k)dispatch({type:"LOT_ADD",kitchenId:k,lot:{...lot,id:genId(),addedAt:nowISO()}}); },
      addRecipe:    (recipe)  => { const k=kid(); if(k)dispatch({type:"RECIPE_ADD",kitchenId:k,recipe:{...recipe,id:genId(),createdAt:nowISO()}}); },
      updateRecipe: (id,patch)=> { const k=kid(); if(k)dispatch({type:"RECIPE_UPDATE",kitchenId:k,id,patch}); },
      deleteRecipe: (id)      => { const k=kid(); if(k)dispatch({type:"RECIPE_DELETE",kitchenId:k,id}); },
      startService: (covers,notes)=>{ const k=kid(); if(k)dispatch({type:"SERVICE_START",kitchenId:k,covers,notes}); },
      endService:   ()        => { const k=kid(); if(k)dispatch({type:"SERVICE_END",kitchenId:k}); },
      addTicket:    (ticket)  => { const k=kid(); if(k)dispatch({type:"SERVICE_TICKET",kitchenId:k,ticket:{...ticket,id:genId(),createdAt:nowISO(),status:"pending"}}); },
      updateTicket: (id,patch)=> { const k=kid(); if(k)dispatch({type:"TICKET_UPDATE",kitchenId:k,id,patch}); },
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
                <div key={item.id} style={{padding:"13px 22px",minHeight:64,display:"flex",alignItems:"center",gap:12,borderBottom:i<5?`1px solid ${t.div}`:"none"}}>
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
                <div key={item.id} style={{padding:"13px 22px",minHeight:64,display:"flex",alignItems:"center",gap:12,borderBottom:i<5?`1px solid ${t.div}`:"none"}}>
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
  useEffect(() => { try { localStorage.setItem(STORAGE, JSON.stringify(tasks)); } catch {} }, [tasks, STORAGE]);

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
  const { kitchen, prepAdd, prepToggle, prepRemove, prepUpdate, prepMove, shopAdd, allItems, currentRole } = useK();
  const toast = useToast();
  const canEdit = CAN_EDIT.includes(currentRole());
  const [name, setName] = useState("");
  const [qty,  setQty]  = useState("1");
  const [unit, setUnit] = useState("pz");
  const [prio, setPrio] = useState("normale");
  const [notes,setNotes]= useState("");
  const [tab,          setTab]          = useState("lista");
  const [filterReparto,setFilterReparto] = useState("tutti");
  const [filterTurno,  setFilterTurno]   = useState("tutti");
  const [selectedPreps,setSelectedPreps] = useState({});
  const [showAISpesa,  setShowAISpesa]   = useState(false);
  const [aiSpesaPreps, setAiSpesaPreps]  = useState([]);
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

  const [fReparto, setFReparto] = useState("cucina_calda");
  const [fTurno,   setFTurno]   = useState("mattina");

  function add() {
    if(!name.trim()) { toast("Inserisci il nome della preparazione","error"); return; }
    addCustomPrep(name.trim());
    prepAdd(name.trim(), parseFloat(qty)||1, unit, prio, notes);
    // reparto/turno vanno direttamente nel dispatch tramite prepAdd patch
    toast(`${name} aggiunto alle preparazioni`,"success");
    setName(""); setQty("1"); setNotes("");
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Tab switcher */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[{k:"lista",l:"📋 Lista"},{k:"kanban",l:"🗂 Kanban"},{k:"agenda",l:"📅 Agenda"}].map(({k,l})=>(
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

      {tab==="kanban"&&(
        <div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {REPARTI.map(r=>(
              <button key={r.k} onClick={()=>setFilterReparto(r.k)} style={{
                padding:"5px 12px",borderRadius:8,border:"none",cursor:"pointer",
                fontFamily:"var(--mono)",fontSize:9,
                background:filterReparto===r.k?t.accent:t.bgCard,
                color:filterReparto===r.k?"#fff":t.inkMuted,transition:"all 0.15s",
              }}>{r.l}</button>
            ))}
            {TURNI.map(r=>(
              <button key={r.k} onClick={()=>setFilterTurno(r.k)} style={{
                padding:"5px 12px",borderRadius:8,border:"none",cursor:"pointer",
                fontFamily:"var(--mono)",fontSize:9,
                background:filterTurno===r.k?t.secondary:t.bgCard,
                color:filterTurno===r.k?"#fff":t.inkMuted,transition:"all 0.15s",
              }}>{r.l}</button>
            ))}
          </div>

          {Object.values(selectedPreps).filter(Boolean).length>0&&(
            <div style={{padding:"10px 16px",background:`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`,borderRadius:10,marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
              <span style={{color:"#fff",fontFamily:"var(--serif)",fontSize:12,flex:1}}>
                {Object.values(selectedPreps).filter(Boolean).length} preparazioni selezionate
              </span>
              <button onClick={()=>{
                setAiSpesaPreps(preps.filter(p=>selectedPreps[p.id]));
                setShowAISpesa(true);
              }} style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",background:"rgba(255,255,255,0.2)",color:"#fff",fontFamily:"var(--mono)",fontSize:9}}>
                🤖 Genera Spesa AI
              </button>
              <button onClick={()=>setSelectedPreps({})} style={{background:"none",border:"none",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:14}}>✕</button>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {KANBAN_COLS.map(col=>{
              const colPreps = preps.filter(p=>{
                if((p.status||"da_fare")!==col.key) return false;
                if(filterReparto!=="tutti"&&p.reparto!==filterReparto) return false;
                if(filterTurno!=="tutti"&&p.turno!==filterTurno) return false;
                return true;
              });
              return (
                <div key={col.key} style={{background:t.bgAlt,borderRadius:12,padding:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:col.color}}/>
                    <span className="mono" style={{fontSize:9,letterSpacing:"0.1em",color:t.ink}}>{col.label.toUpperCase()}</span>
                    <span style={{marginLeft:"auto",background:t.bgCard,borderRadius:8,padding:"1px 6px",fontSize:8,color:t.inkFaint,fontFamily:"var(--mono)"}}>{colPreps.length}</span>
                  </div>
                  {colPreps.map(prep=>(
                    <div key={prep.id} style={{position:"relative"}}>
                      <input type="checkbox" checked={!!selectedPreps[prep.id]}
                        onChange={e=>setSelectedPreps(p=>({...p,[prep.id]:e.target.checked}))}
                        style={{position:"absolute",top:8,right:8,zIndex:1,accentColor:t.gold,cursor:"pointer"}}/>
                      <KanbanCard
                        prep={prep} t={t} canEdit={canEdit}
                        onUpdate={prepUpdate}
                        onMove={prepMove}
                        onRemove={prepRemove}
                        onAISpesa={p=>{setAiSpesaPreps([p]);setShowAISpesa(true);}}
                      />
                    </div>
                  ))}
                  {colPreps.length===0&&(
                    <div style={{padding:"16px 0",textAlign:"center",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:11}}>Vuoto</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAISpesa&&(
        <PrepToShoppingPanel
          preps={aiSpesaPreps} allItems={allItems} t={t}
          onImport={(name,qty,unit,cat,notes)=>shopAdd(name,qty,unit,cat,notes)}
          onClose={()=>{setShowAISpesa(false);setSelectedPreps({});}}
        />
      )}
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
            <LuxSelect value={fReparto} onChange={e=>setFReparto(e.target.value)} t={t}>
              {REPARTI.filter(r=>r.k!=="tutti").map(r=><option key={r.k} value={r.k}>{r.l}</option>)}
            </LuxSelect>
            <LuxSelect value={fTurno} onChange={e=>setFTurno(e.target.value)} t={t}>
              {TURNI.filter(r=>r.k!=="tutti").map(r=><option key={r.k} value={r.k}>{r.l}</option>)}
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
   KANBAN CARD
   ════════════════════════════════════════════════════════ */
function KanbanCard({ prep, t, canEdit, onUpdate, onMove, onRemove, onAISpesa }) {
  const [expanded, setExpanded] = useState(false);
  const dest  = DEST_OPTS.find(d => d.key === prep.destination);
  const badge = expiryBadge(prep.expiresAt);
  const hours = hoursUntil(prep.expiresAt);

  return (
    <div style={{
      background:t.bgCard, borderRadius:10, overflow:"hidden",
      border:`1px solid ${badge ? t.accent+"55" : t.div}`,
      boxShadow:`0 2px 8px ${t.shadow}`, marginBottom:8, transition:"all 0.2s",
    }}>
      {prep.expiresAt && (()=>{
        const pct = hours===null ? 0 : Math.min(Math.max((1-(hours/48))*100,0),100);
        const col = !hours||hours<=0 ? t.danger : hours<=12 ? t.danger : hours<=48 ? t.warning : t.success;
        return <div style={{height:3,background:t.bgAlt}}><div style={{height:"100%",width:`${pct}%`,background:col,transition:"width 1s"}}/></div>;
      })()}
      <div style={{padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontFamily:"var(--serif)",fontStyle:"italic",color:t.ink,fontWeight:500}}>{prep.name}</div>
            <div className="mono" style={{fontSize:8,color:t.inkFaint,marginTop:2}}>
              {prep.qty||1} {prep.unit||"pz"}
              {prep.reparto && ` · ${REPARTI.find(r=>r.k===prep.reparto)?.l||prep.reparto}`}
              {prep.turno   && ` · ${TURNI.find(r=>r.k===prep.turno)?.l||prep.turno}`}
            </div>
          </div>
          {canEdit && <button onClick={()=>setExpanded(e=>!e)} style={{background:"none",border:"none",color:t.inkFaint,cursor:"pointer",fontSize:13,padding:2}}>{expanded?"▲":"▼"}</button>}
        </div>

        {dest && (
          <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:6,background:dest.color+"22",border:`1px solid ${dest.color}44`,fontSize:9,color:dest.color,fontFamily:"var(--mono)"}}>
            {dest.icon} {dest.label}
          </span>
        )}
        {badge && (
          <span style={{display:"inline-flex",alignItems:"center",padding:"3px 8px",borderRadius:6,background:badge.bg+"22",border:`1px solid ${badge.bg}44`,fontSize:9,color:badge.bg,fontFamily:"var(--mono)",marginLeft:4}}>
            {badge.label}
          </span>
        )}

        {expanded && canEdit && (
          <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
            <div>
              <div className="mono" style={{fontSize:7,color:t.inkFaint,marginBottom:4}}>DESTINAZIONE</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {DEST_OPTS.map(d=>(
                  <button key={d.key} onClick={()=>onMove(prep.id,d.key)} style={{
                    padding:"4px 8px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,
                    background:prep.destination===d.key?d.color:t.bgAlt,
                    color:prep.destination===d.key?"#fff":t.inkMuted,transition:"all 0.15s",
                  }}>{d.icon} {d.label}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="mono" style={{fontSize:7,color:t.inkFaint,marginBottom:4}}>STATUS</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {KANBAN_COLS.map(c=>(
                  <button key={c.key} onClick={()=>onUpdate(prep.id,{status:c.key})} style={{
                    padding:"4px 8px",borderRadius:6,border:"none",cursor:"pointer",fontSize:9,
                    background:prep.status===c.key?c.color:t.bgAlt,
                    color:prep.status===c.key?"#fff":t.inkMuted,transition:"all 0.15s",
                  }}>{c.icon} {c.label}</button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>onAISpesa(prep)} style={{
                padding:"5px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:9,
                background:`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`,color:"#fff",
                fontFamily:"var(--mono)",letterSpacing:"0.06em",
              }}>🤖 AI → Spesa</button>
              <button onClick={()=>onRemove(prep.id)} style={{...btnSmall(t),color:t.danger}}>✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   AI → SPESA DA PREPARAZIONE
   ════════════════════════════════════════════════════════ */
function PrepToShoppingPanel({ preps, allItems, t, onImport, onClose }) {
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [reparto,  setReparto]  = useState("cucina_calda");
  const [selected, setSelected] = useState({});

  async function generate() {
    setLoading(true); setResult(null);
    try {
      const ctx = {
        preparazioni: preps.map(p=>({nome:p.name,qty:p.qty||1,unit:p.unit||"pz",turno:p.turno||"oggi"})),
        giacenze:     allItems().map(i=>({nome:i.name,qty:i.quantity,unit:i.unit})),
        reparto:      AI_PROMPTS[reparto]?.label,
      };
      const data = await callAI({
        systemPrompt: AI_PROMPTS[reparto].system + `
Genera lista spesa. Output SOLO JSON:
{"reparti":[{"nome":string,"items":[{"nome":string,"qty":number,"unit":string,"urgenza":"oggi"|"entro48h"|"settimanale","gia_in_giacenza":boolean,"nota":string|null}]}],"note_chef":string}`,
        userContext: ctx, maxTokens:1200, expectJSON:true,
      });
      setResult(data);
      const sel = {};
      (data.reparti||[]).forEach(r=>r.items.forEach(i=>{ if(!i.gia_in_giacenza) sel[i.nome]=true; }));
      setSelected(sel);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  function importSelected() {
    (result?.reparti||[]).forEach(r=>r.items.forEach(i=>{
      if(selected[i.nome]) onImport(i.nome, i.qty, i.unit, reparto, i.nota||"");
    }));
    onClose();
  }

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:9000,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:t.bgCard,borderRadius:16,width:"min(540px,95vw)",maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:`0 24px 80px ${t.shadowStrong}`}}>
        <div style={{padding:"16px 22px",background:`linear-gradient(135deg,${t.secondary},${t.secondaryDeep})`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{color:"#fff",fontFamily:"var(--serif)",fontSize:14,fontWeight:500}}>🤖 AI → Lista Spesa</div>
            <div className="mono" style={{fontSize:7,color:"rgba(255,255,255,0.5)",marginTop:2}}>{preps.length} PREPARAZIONI SELEZIONATE</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,0.6)",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:20}}>
          <div style={{marginBottom:14}}>
            <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:8}}>TEMPLATE REPARTO</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {Object.entries(AI_PROMPTS).map(([k,v])=>(
                <button key={k} onClick={()=>setReparto(k)} style={{
                  padding:"5px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:10,
                  background:reparto===k?`linear-gradient(135deg,${t.accent},${t.accentDeep})`:t.bgAlt,
                  color:reparto===k?"#fff":t.inkMuted,fontFamily:"var(--mono)",transition:"all 0.15s",
                }}>{v.icon} {v.label}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:14,padding:12,background:t.bgAlt,borderRadius:10}}>
            <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:6}}>PREPARAZIONI</div>
            {preps.map(p=>(
              <div key={p.id} style={{fontSize:12,fontFamily:"var(--serif)",fontStyle:"italic",color:t.ink,padding:"2px 0"}}>
                · {p.name} — {p.qty||1} {p.unit||"pz"}
              </div>
            ))}
          </div>
          {!result && (
            <Btn t={t} variant="gold" onClick={generate} disabled={loading} style={{width:"100%"}}>
              {loading ? "🤖 Analisi in corso…" : "🤖 Genera Lista Spesa AI"}
            </Btn>
          )}
          {result && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {result.note_chef && (
                <div style={{padding:12,background:t.goldFaint,borderRadius:10,border:`1px solid ${t.goldDim}`,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink}}>
                  💡 {result.note_chef}
                </div>
              )}
              {(result.reparti||[]).map(r=>(
                <div key={r.nome}>
                  <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:6}}>{r.nome?.toUpperCase()}</div>
                  {r.items.map(i=>(
                    <div key={i.nome} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:t.bgAlt,borderRadius:8,marginBottom:4,opacity:i.gia_in_giacenza?0.5:1}}>
                      <input type="checkbox" checked={!!selected[i.nome]} onChange={e=>setSelected(p=>({...p,[i.nome]:e.target.checked}))} style={{accentColor:t.gold,cursor:"pointer"}} disabled={i.gia_in_giacenza}/>
                      <div style={{flex:1}}>
                        <span style={{fontSize:12,fontFamily:"var(--serif)",fontStyle:"italic",color:t.ink}}>{i.nome}</span>
                        <span className="mono" style={{fontSize:9,color:t.inkFaint,marginLeft:8}}>{i.qty} {i.unit}</span>
                        {i.gia_in_giacenza && <span className="mono" style={{fontSize:8,color:t.success,marginLeft:6}}>✓ IN GIACENZA</span>}
                      </div>
                      <span style={{fontSize:8,padding:"2px 6px",borderRadius:4,fontFamily:"var(--mono)",
                        background:i.urgenza==="oggi"?t.accentGlow:i.urgenza==="entro48h"?t.goldFaint:t.bgCard,
                        color:i.urgenza==="oggi"?t.danger:i.urgenza==="entro48h"?t.gold:t.inkFaint,
                      }}>{i.urgenza}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{display:"flex",gap:8}}>
                <Btn t={t} variant="gold" onClick={importSelected} style={{flex:1}}>
                  ✓ Importa ({Object.values(selected).filter(Boolean).length} articoli)
                </Btn>
                <Btn t={t} variant="ghost" onClick={()=>setResult(null)}>↺ Rigenera</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
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
   SERVIZIO LIVE VIEW + PLATING MODE
   ════════════════════════════════════════════════════════ */
function ServizioView({ t }) {
  const { kitchen, startService, endService, addTicket, updateTicket, allItems, currentRole } = useK();
  const toast = useToast();
  const canEdit = CAN_EDIT.includes(currentRole());
  const service = kitchen?.service||{};
  const tickets = (kitchen?.tickets||[]);

  const [covers,    setCovers]    = useState("30");
  const [svcNotes,  setSvcNotes]  = useState("");
  const [plating,   setPlating]   = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPlan,    setAiPlan]    = useState(null);
  const [newTicket, setNewTicket] = useState({table:"",items:"",notes:""});
  const [elapsed,   setElapsed]   = useState(0);

  useEffect(()=>{
    if(!service.active) return;
    const iv = setInterval(()=>{
      const ms = Date.now() - new Date(service.startedAt).getTime();
      setElapsed(Math.floor(ms/60000));
    },10000);
    return ()=>clearInterval(iv);
  },[service.active, service.startedAt]);

  async function generateServicePlan() {
    setAiLoading(true);
    try {
      const items = allItems();
      const preps = (kitchen?.preps||[]).filter(p=>p.status==="pronta");
      const plan = await callAI({
        systemPrompt:`Sei un executive chef Michelin che gestisce il servizio. Analizza giacenze e preparazioni pronte e genera il piano di servizio ottimale per ${covers} coperti. Output SOLO JSON:
{"timing":[{"ora":string,"azione":string,"partita":string}],"alert":[{"tipo":"critico"|"attenzione","msg":string}],"piatti_disponibili":[{"nome":string,"porzioni":number,"note":string}],"consiglio_chef":string}`,
        userContext:{
          coperti:parseInt(covers),
          preparazioni_pronte:preps.map(p=>({nome:p.name,qty:p.qty,unit:p.unit,dest:p.destination})),
          giacenze:items.slice(0,30).map(i=>({nome:i.name,qty:i.quantity,unit:i.unit})),
        },
        maxTokens:800, expectJSON:true,
      });
      setAiPlan(plan);
    } catch(e){ toast("Errore generazione piano","error"); }
    finally { setAiLoading(false); }
  }

  // ── PLATING MODE ──────────────────────────────────────
  if(plating) {
    const activeTickets = tickets.filter(x=>x.status==="pending"||x.status==="firing");
    return (
      <div style={{
        position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:10000,
        background:"#000",display:"flex",flexDirection:"column",
        fontFamily:"var(--mono)",userSelect:"none",
      }}>
        <div style={{padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #222"}}>
          <div>
            <span style={{color:"#FFD700",fontSize:18,letterSpacing:"0.1em"}}>⚡ PLATING MODE</span>
            <span style={{color:"#666",fontSize:12,marginLeft:16}}>{elapsed}min · {covers} coperti</span>
          </div>
          <button onClick={()=>setPlating(false)} style={{background:"#FF3333",border:"none",color:"#fff",padding:"10px 20px",borderRadius:8,cursor:"pointer",fontSize:14,fontFamily:"var(--mono)"}}>✕ ESCI</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
          {activeTickets.length===0&&(
            <div style={{textAlign:"center",padding:"80px 0",color:"#444",fontSize:24}}>Nessun ticket attivo</div>
          )}
          {activeTickets.map(tk=>(
            <div key={tk.id} style={{
              background:tk.status==="firing"?"#1A0A00":"#111",
              border:`2px solid ${tk.status==="firing"?"#FF6600":"#333"}`,
              borderRadius:12,padding:"20px 24px",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
                <span style={{fontSize:32,color:"#FFD700",fontWeight:700}}>T{tk.table}</span>
                <span style={{color:"#666",fontSize:12,flex:1}}>
                  {new Date(tk.createdAt).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}
                </span>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>updateTicket(tk.id,{status:"firing"})} style={{
                    background:"#FF6600",border:"none",color:"#fff",padding:"12px 20px",
                    borderRadius:8,cursor:"pointer",fontSize:16,minWidth:80,
                  }}>🔥 FIRE</button>
                  <button onClick={()=>updateTicket(tk.id,{status:"done"})} style={{
                    background:"#00CC44",border:"none",color:"#fff",padding:"12px 20px",
                    borderRadius:8,cursor:"pointer",fontSize:16,minWidth:80,
                  }}>✅ OK</button>
                </div>
              </div>
              <div style={{color:"#fff",fontSize:18,lineHeight:1.6}}>{tk.items}</div>
              {tk.notes&&<div style={{color:"#888",fontSize:14,marginTop:8}}>· {tk.notes}</div>}
            </div>
          ))}
        </div>
        {/* Add ticket bar */}
        <div style={{padding:"12px 16px",borderTop:"1px solid #222",display:"flex",gap:8}}>
          <input value={newTicket.table} onChange={e=>setNewTicket(p=>({...p,table:e.target.value}))}
            placeholder="Tavolo" style={{background:"#111",border:"1px solid #333",color:"#fff",borderRadius:8,padding:"12px",width:80,fontSize:16,fontFamily:"var(--mono)"}}/>
          <input value={newTicket.items} onChange={e=>setNewTicket(p=>({...p,items:e.target.value}))}
            placeholder="Piatti (es. 2x Branzino, 1x Risotto)" style={{background:"#111",border:"1px solid #333",color:"#fff",borderRadius:8,padding:"12px",flex:1,fontSize:14,fontFamily:"var(--mono)"}}/>
          <button onClick={()=>{
            if(!newTicket.table||!newTicket.items) return;
            addTicket({table:newTicket.table,items:newTicket.items,notes:newTicket.notes});
            setNewTicket({table:"",items:"",notes:""});
          }} style={{background:"#FFD700",border:"none",color:"#000",padding:"12px 20px",borderRadius:8,cursor:"pointer",fontSize:16,fontWeight:700}}>+ TICKET</button>
        </div>
      </div>
    );
  }

  // ── NORMAL VIEW ───────────────────────────────────────
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Status bar */}
      <Card t={t} style={{padding:20}}>
        <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
          <div style={{
            width:12,height:12,borderRadius:"50%",flexShrink:0,
            background:service.active?t.success:t.inkFaint,
            boxShadow:service.active?`0 0 8px ${t.success}`:undefined,
            animation:service.active?"pulse 1.5s ease-in-out infinite":undefined,
          }}/>
          <span style={{fontFamily:"var(--serif)",fontSize:15,fontStyle:"italic",color:t.ink}}>
            {service.active?`Servizio attivo — ${elapsed} min · ${service.covers} coperti`:"Servizio non attivo"}
          </span>
          {service.active&&(
            <>
              <button onClick={()=>setPlating(true)} style={{
                padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",
                background:`linear-gradient(135deg,${t.accent},${t.accentDeep})`,color:"#fff",
                fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.08em",
              }}>⚡ PLATING MODE</button>
              <button onClick={()=>{endService();toast("Servizio terminato","success");}} style={{
                padding:"8px 16px",borderRadius:8,border:`1px solid ${t.div}`,cursor:"pointer",
                background:t.bgAlt,color:t.inkMuted,fontFamily:"var(--mono)",fontSize:10,
              }}>■ Termina</button>
            </>
          )}
        </div>
      </Card>

      {!service.active&&(
        <Card t={t} style={{padding:20}}>
          <div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:12}}>AVVIA SERVIZIO</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <LuxInput value={covers} onChange={e=>setCovers(e.target.value)} type="number" placeholder="Coperti" t={t}/>
            <LuxInput value={svcNotes} onChange={e=>setSvcNotes(e.target.value)} placeholder="Note servizio" t={t}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn t={t} variant="gold" onClick={()=>{startService(parseInt(covers)||0,svcNotes);toast(`Servizio avviato — ${covers} coperti`,"success");}} disabled={!covers}>
              ▶ Avvia Servizio
            </Btn>
            <Btn t={t} variant="ghost" onClick={generateServicePlan} disabled={aiLoading}>
              {aiLoading?"🤖 Analisi…":"🤖 Piano AI"}
            </Btn>
          </div>
        </Card>
      )}

      {/* AI Plan */}
      {aiPlan&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {aiPlan.consiglio_chef&&(
            <Card t={t} style={{padding:16}}>
              <div className="mono" style={{fontSize:8,color:t.gold,marginBottom:8}}>💡 CONSIGLIO CHEF AI</div>
              <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,color:t.ink}}>{aiPlan.consiglio_chef}</div>
            </Card>
          )}
          {aiPlan.alert?.length>0&&(
            <Card t={t} style={{padding:16}}>
              <div className="mono" style={{fontSize:8,color:t.danger,marginBottom:8}}>⚠ ALERT</div>
              {aiPlan.alert.map((a,i)=>(
                <div key={i} style={{padding:"8px 12px",borderRadius:8,background:a.tipo==="critico"?t.accentGlow:t.goldFaint,marginBottom:4,fontSize:12,color:a.tipo==="critico"?t.danger:t.gold,fontFamily:"var(--mono)"}}>
                  {a.tipo==="critico"?"🔴":"🟡"} {a.msg}
                </div>
              ))}
            </Card>
          )}
          {aiPlan.timing?.length>0&&(
            <Card t={t} style={{padding:0}}>
              <CardHeader t={t} title="TIMELINE SERVIZIO"/>
              {aiPlan.timing.map((t2,i)=>(
                <div key={i} style={{padding:"10px 22px",display:"flex",gap:16,alignItems:"center",borderTop:`1px solid ${t.div}`}}>
                  <span className="mono" style={{fontSize:10,color:t.gold,minWidth:50}}>{t2.ora}</span>
                  <span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink,flex:1}}>{t2.azione}</span>
                  <span className="mono" style={{fontSize:9,color:t.inkFaint}}>{t2.partita}</span>
                </div>
              ))}
            </Card>
          )}
          {aiPlan.piatti_disponibili?.length>0&&(
            <Card t={t} style={{padding:0}}>
              <CardHeader t={t} title="PIATTI DISPONIBILI"/>
              {aiPlan.piatti_disponibili.map((p,i)=>(
                <div key={i} style={{padding:"10px 22px",display:"flex",gap:12,alignItems:"center",borderTop:`1px solid ${t.div}`}}>
                  <span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,color:t.ink,flex:1}}>{p.nome}</span>
                  <span className="mono" style={{fontSize:10,color:t.gold}}>{p.porzioni} pz</span>
                  {p.note&&<span style={{fontSize:10,color:t.inkFaint}}>{p.note}</span>}
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* Tickets */}
      {service.active&&(
        <Card t={t} style={{padding:0}}>
          <CardHeader t={t} title="TICKET ATTIVI" right={
            <button onClick={()=>setPlating(true)} style={{...btnSmall(t),background:t.accentGlow,color:t.danger}}>⚡ Plating</button>
          }/>
          <div style={{padding:16}}>
            <div style={{display:"grid",gridTemplateColumns:"80px 1fr auto",gap:8,marginBottom:12}}>
              <LuxInput value={newTicket.table} onChange={e=>setNewTicket(p=>({...p,table:e.target.value}))} placeholder="Tavolo" t={t}/>
              <LuxInput value={newTicket.items} onChange={e=>setNewTicket(p=>({...p,items:e.target.value}))} placeholder="Piatti" t={t}/>
              <Btn t={t} onClick={()=>{
                if(!newTicket.table||!newTicket.items) return;
                addTicket({table:newTicket.table,items:newTicket.items,notes:""});
                setNewTicket({table:"",items:"",notes:""});
              }}>+ Ticket</Btn>
            </div>
            {tickets.filter(x=>x.status!=="done").map(tk=>(
              <div key={tk.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:t.bgAlt,borderRadius:8,marginBottom:6}}>
                <span style={{fontFamily:"var(--mono)",fontSize:14,color:t.gold,fontWeight:700,minWidth:40}}>T{tk.table}</span>
                <span style={{flex:1,fontSize:12,color:t.ink,fontFamily:"var(--serif)",fontStyle:"italic"}}>{tk.items}</span>
                <button onClick={()=>updateTicket(tk.id,{status:"firing"})} style={{...btnSmall(t),background:t.accentGlow,color:t.danger}}>🔥 Fire</button>
                <button onClick={()=>updateTicket(tk.id,{status:"done"})} style={{...btnSmall(t),background:`rgba(61,122,74,0.15)`,color:t.success}}>✅</button>
              </div>
            ))}
            {tickets.filter(x=>x.status==="done").length>0&&(
              <div className="mono" style={{fontSize:9,color:t.inkFaint,textAlign:"center",marginTop:8}}>
                {tickets.filter(x=>x.status==="done").length} ticket completati
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   HACCP VIEW — temperature + lotti + tracciabilità
   ════════════════════════════════════════════════════════ */
const ZONES_HACCP = [
  {key:"frigo1",   label:"Frigo 1",      target:4,  tolerance:2, icon:"❄️"},
  {key:"frigo2",   label:"Frigo 2",      target:4,  tolerance:2, icon:"❄️"},
  {key:"freezer",  label:"Congelatore",  target:-18, tolerance:3, icon:"🧊"},
  {key:"abbattitore",label:"Abbattitore",target:-40, tolerance:5, icon:"🥶"},
  {key:"lavaggio", label:"Lavaggio",     target:82,  tolerance:3, icon:"🫧"},
  {key:"dispensa", label:"Dispensa",     target:18,  tolerance:4, icon:"🏺"},
];

function HaccpView({ t }) {
  const { kitchen, recordTemp, addLot, allItems, currentRole } = useK();
  const toast = useToast();
  const canEdit = CAN_EDIT.includes(currentRole());
  const tempLogs = kitchen?.tempLogs||[];
  const lots     = kitchen?.lots||[];

  const [tab, setTab] = useState("temperature");
  const [temps, setTemps] = useState(()=>Object.fromEntries(ZONES_HACCP.map(z=>[z.key,""])));
  const [lotForm, setLotForm] = useState({name:"",supplier:"",lotCode:"",receivedAt:todayDate(),expiresAt:"",notes:""});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport,  setAiReport]  = useState(null);

  function saveTemps() {
    const entries = ZONES_HACCP.filter(z=>temps[z.key]!=="").map(z=>({
      zone:z.key, zoneLabel:z.label,
      value:parseFloat(temps[z.key]),
      target:z.target, tolerance:z.tolerance,
      ok:Math.abs(parseFloat(temps[z.key])-z.target)<=z.tolerance,
    }));
    if(!entries.length){toast("Inserisci almeno una temperatura","error");return;}
    entries.forEach(e=>recordTemp(e));
    toast(`${entries.length} temperature salvate`,"success");
    setTemps(Object.fromEntries(ZONES_HACCP.map(z=>[z.key,""])));
  }

  function saveLot() {
    if(!lotForm.name||!lotForm.lotCode){toast("Compila nome e codice lotto","error");return;}
    addLot(lotForm);
    toast(`Lotto ${lotForm.lotCode} registrato`,"success");
    setLotForm({name:"",supplier:"",lotCode:"",receivedAt:todayDate(),expiresAt:"",notes:""});
  }

  async function generateHaccpReport() {
    setAiLoading(true);
    try {
      const recentTemps = tempLogs.slice(0,50);
      const expiring = allItems().filter(i=>{ const h=hoursUntil(i.expiresAt); return h!==null&&h<=48; });
      const report = await callAI({
        systemPrompt:`Sei un consulente HACCP per cucine Michelin. Analizza i dati e genera un report di conformità. Output SOLO JSON:
{"conformita":"conforme"|"non_conforme"|"attenzione","anomalie":[{"zona":string,"msg":string,"gravita":"bassa"|"media"|"alta"}],"prodotti_a_rischio":[{"nome":string,"motivo":string}],"azioni_correttive":[string],"nota_consulente":string}`,
        userContext:{temperature_ultime_24h:recentTemps,prodotti_in_scadenza:expiring.map(i=>({nome:i.name,ore_rimaste:hoursUntil(i.expiresAt)})),lotti_attivi:lots.slice(0,20)},
        maxTokens:800, expectJSON:true,
      });
      setAiReport(report);
    } catch(e){ toast("Errore report AI","error"); }
    finally { setAiLoading(false); }
  }

  const conformColor = aiReport?.conformita==="conforme"?t.success:aiReport?.conformita==="non_conforme"?t.danger:t.warning;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[{k:"temperature",l:"🌡 Temperature"},{k:"lotti",l:"📦 Lotti"},{k:"report",l:"🤖 Report AI"}].map(({k,l})=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",
            fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.08em",
            background:tab===k?`linear-gradient(135deg,${t.accent},${t.accentDeep})`:t.bgCard,
            color:tab===k?"#fff":t.inkMuted,boxShadow:`0 1px 4px ${t.shadow}`,transition:"all 0.2s",
          }}>{l}</button>
        ))}
      </div>

      {tab==="temperature"&&(
        <>
          <Card t={t} style={{padding:20}}>
            <div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:14}}>RILEVAZIONE TEMPERATURE · {new Date().toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:14}}>
              {ZONES_HACCP.map(z=>{
                const val=temps[z.key]; const num=parseFloat(val);
                const ok=val===""||Math.abs(num-z.target)<=z.tolerance;
                return (
                  <div key={z.key}>
                    <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:4}}>{z.icon} {z.label.toUpperCase()}</div>
                    <div style={{position:"relative"}}>
                      <LuxInput value={val} onChange={e=>setTemps(p=>({...p,[z.key]:e.target.value}))}
                        type="number" placeholder={`${z.target}°C`} t={t}
                        style={{border:`1.5px solid ${val===""?t.div:ok?t.success:t.danger}`}}/>
                      {val!==""&&<span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:10}}>{ok?"✅":"⚠️"}</span>}
                    </div>
                    <div className="mono" style={{fontSize:7,color:t.inkFaint,marginTop:2}}>Target: {z.target}°C ±{z.tolerance}</div>
                  </div>
                );
              })}
            </div>
            {canEdit&&<Btn t={t} variant="gold" onClick={saveTemps}>💾 Salva Rilevazione</Btn>}
          </Card>

          {/* Log ultime rilevazioni */}
          {tempLogs.length>0&&(
            <Card t={t} style={{padding:0}}>
              <CardHeader t={t} title="ULTIME RILEVAZIONI"/>
              {tempLogs.slice(0,12).map((l,i)=>(
                <div key={l.id||i} style={{padding:"9px 22px",display:"flex",gap:12,alignItems:"center",borderTop:`1px solid ${t.div}`}}>
                  <span style={{fontSize:10}}>{l.ok?"✅":"⚠️"}</span>
                  <span style={{flex:1,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink}}>{l.zoneLabel}</span>
                  <span className="mono" style={{fontSize:11,color:l.ok?t.success:t.danger,fontWeight:600}}>{l.value}°C</span>
                  <span className="mono" style={{fontSize:8,color:t.inkFaint}}>{fmtDate(l.recordedAt)}</span>
                </div>
              ))}
            </Card>
          )}
        </>
      )}

      {tab==="lotti"&&(
        <>
          {canEdit&&(
            <Card t={t} style={{padding:20}}>
              <div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:12}}>REGISTRA LOTTO</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                <LuxInput value={lotForm.name} onChange={e=>setLotForm(p=>({...p,name:e.target.value}))} placeholder="Prodotto" t={t}/>
                <LuxInput value={lotForm.supplier} onChange={e=>setLotForm(p=>({...p,supplier:e.target.value}))} placeholder="Fornitore" t={t}/>
                <LuxInput value={lotForm.lotCode} onChange={e=>setLotForm(p=>({...p,lotCode:e.target.value}))} placeholder="Codice lotto" t={t}/>
                <LuxInput value={lotForm.receivedAt} onChange={e=>setLotForm(p=>({...p,receivedAt:e.target.value}))} type="date" t={t}/>
                <div style={{gridColumn:"1/-1"}}>
                  <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:4}}>SCADENZA</div>
                  <ExpiryQuickPicker value={lotForm.expiresAt} onChange={v=>setLotForm(p=>({...p,expiresAt:v}))} t={t}/>
                </div>
                <LuxInput value={lotForm.notes} onChange={e=>setLotForm(p=>({...p,notes:e.target.value}))} placeholder="Note" t={t} style={{gridColumn:"1/-1"}}/>
              </div>
              <Btn t={t} variant="gold" onClick={saveLot}>+ Registra Lotto</Btn>
            </Card>
          )}
          <Card t={t} style={{padding:0}}>
            <CardHeader t={t} title={`LOTTI REGISTRATI (${lots.length})`}/>
            {lots.length===0&&<div style={{padding:24,textAlign:"center",color:t.inkFaint,fontFamily:"var(--serif)",fontStyle:"italic"}}>Nessun lotto registrato</div>}
            {lots.slice(0,30).map((l,i)=>{
              const h=hoursUntil(l.expiresAt);
              const badge=h!==null?(h<=0?"⛔ SCADUTO":h<=48?"⚠️ In scadenza":"✅ OK"):"—";
              return (
                <div key={l.id||i} style={{padding:"11px 22px",display:"flex",gap:12,alignItems:"center",borderTop:`1px solid ${t.div}`}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,color:t.ink}}>{l.name}</div>
                    <div className="mono" style={{fontSize:8,color:t.inkFaint}}>Lotto: {l.lotCode} · {l.supplier}</div>
                  </div>
                  <span className="mono" style={{fontSize:9,color:h!==null&&h<=48?t.danger:t.inkFaint}}>{badge}</span>
                  {l.expiresAt&&<span className="mono" style={{fontSize:8,color:t.inkFaint}}>{l.expiresAt}</span>}
                </div>
              );
            })}
          </Card>
        </>
      )}

      {tab==="report"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Btn t={t} variant="gold" onClick={generateHaccpReport} disabled={aiLoading} style={{alignSelf:"flex-start"}}>
            {aiLoading?"🤖 Analisi HACCP in corso…":"🤖 Genera Report HACCP AI"}
          </Btn>
          {aiReport&&(
            <>
              <Card t={t} style={{padding:20,border:`2px solid ${conformColor}44`}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:16,height:16,borderRadius:"50%",background:conformColor}}/>
                  <span style={{fontFamily:"var(--serif)",fontSize:16,fontStyle:"italic",color:t.ink}}>
                    Stato: <strong>{aiReport.conformita?.toUpperCase()}</strong>
                  </span>
                </div>
                {aiReport.nota_consulente&&<div style={{marginTop:10,fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.inkSoft,padding:"10px 14px",background:t.bgAlt,borderRadius:8}}>💡 {aiReport.nota_consulente}</div>}
              </Card>
              {aiReport.anomalie?.length>0&&(
                <Card t={t} style={{padding:0}}>
                  <CardHeader t={t} title="ANOMALIE RILEVATE"/>
                  {aiReport.anomalie.map((a,i)=>(
                    <div key={i} style={{padding:"10px 22px",display:"flex",gap:12,borderTop:`1px solid ${t.div}`}}>
                      <span style={{fontSize:12}}>{a.gravita==="alta"?"🔴":a.gravita==="media"?"🟡":"🟢"}</span>
                      <div><div style={{fontSize:12,color:t.ink,fontFamily:"var(--serif)",fontStyle:"italic"}}>{a.msg}</div><div className="mono" style={{fontSize:8,color:t.inkFaint}}>{a.zona}</div></div>
                    </div>
                  ))}
                </Card>
              )}
              {aiReport.azioni_correttive?.length>0&&(
                <Card t={t} style={{padding:16}}>
                  <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:8}}>AZIONI CORRETTIVE</div>
                  {aiReport.azioni_correttive.map((a,i)=>(
                    <div key={i} style={{padding:"6px 0",fontSize:12,color:t.ink,fontFamily:"var(--serif)",fontStyle:"italic",borderBottom:`1px solid ${t.div}`}}>→ {a}</div>
                  ))}
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   FOOD COST VIEW — ricette + schede tecniche + food cost %
   ════════════════════════════════════════════════════════ */
function FoodCostView({ t }) {
  const { kitchen, addRecipe, updateRecipe, deleteRecipe, allItems, currentRole } = useK();
  const toast = useToast();
  const canEdit = CAN_EDIT.includes(currentRole());
  const recipes = kitchen?.recipes||[];

  const [tab,      setTab]      = useState("ricette");
  const [selected, setSelected] = useState(null);
  const [aiLoading,setAiLoading]= useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({name:"",category:"antipasto",portions:4,menuPrice:"",ingredients:[{name:"",qty:"",unit:"kg",costPer:""}]});

  const CATS_RECIPE = ["antipasto","primo","secondo","dessert","pane_pasticceria","salse_basi","altro"];

  function addIngredient() { setForm(p=>({...p,ingredients:[...p.ingredients,{name:"",qty:"",unit:"kg",costPer:""}]})); }
  function updIngredient(i,field,val) { setForm(p=>{const ing=[...p.ingredients];ing[i]={...ing[i],[field]:val};return {...p,ingredients:ing};}); }
  function remIngredient(i) { setForm(p=>({...p,ingredients:p.ingredients.filter((_,j)=>j!==i)})); }

  function calcFoodCost(recipe) {
    const totalCost = (recipe.ingredients||[]).reduce((s,i)=>{
      return s + (parseFloat(i.qty)||0)*(parseFloat(i.costPer)||0);
    },0);
    const costPerPortion = totalCost / (recipe.portions||1);
    const menuPrice = parseFloat(recipe.menuPrice)||0;
    const pct = menuPrice>0 ? (costPerPortion/menuPrice)*100 : null;
    return {totalCost, costPerPortion, pct};
  }

  function saveRecipe() {
    if(!form.name.trim()){toast("Nome ricetta obbligatorio","error");return;}
    addRecipe({...form,portions:parseInt(form.portions)||4});
    toast(`${form.name} salvata`,"success");
    setForm({name:"",category:"antipasto",portions:4,menuPrice:"",ingredients:[{name:"",qty:"",unit:"kg",costPer:""}]});
    setShowForm(false);
  }

  async function analyzeRecipeAI(recipe) {
    setAiLoading(true);
    try {
      const fc = calcFoodCost(recipe);
      const analysis = await callAI({
        systemPrompt:`Sei un food cost controller per ristorante Michelin. Analizza la ricetta e fornisci consigli per ottimizzare il food cost. Output SOLO JSON:
{"valutazione":"ottimo"|"buono"|"da_ottimizzare"|"critico","food_cost_ideale":number,"consigli":[string],"ingredienti_alternativi":[{"originale":string,"alternativa":string,"risparmio_pct":number}],"note_chef":string}`,
        userContext:{
          ricetta:recipe.name, categoria:recipe.category,
          ingredienti:recipe.ingredients, porzioni:recipe.portions,
          prezzo_menu:recipe.menuPrice, food_cost_attuale_pct:fc.pct,
          costo_per_porzione:fc.costPerPortion,
        },
        maxTokens:600, expectJSON:true,
      });
      updateRecipe(recipe.id, {aiAnalysis:analysis});
      toast("Analisi AI completata","success");
    } catch(e){ toast("Errore analisi AI","error"); }
    finally { setAiLoading(false); }
  }

  const fcColor = (pct) => pct===null?"":pct<=28?t.success:pct<=35?t.warning:t.danger;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {[{k:"ricette",l:"📐 Ricette"},{k:"analisi",l:"📊 Analisi FC"}].map(({k,l})=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",
            fontFamily:"var(--mono)",fontSize:10,letterSpacing:"0.08em",
            background:tab===k?`linear-gradient(135deg,${t.accent},${t.accentDeep})`:t.bgCard,
            color:tab===k?"#fff":t.inkMuted,boxShadow:`0 1px 4px ${t.shadow}`,transition:"all 0.2s",
          }}>{l}</button>
        ))}
        {canEdit&&<Btn t={t} variant="gold" onClick={()=>setShowForm(f=>!f)} style={{marginLeft:"auto"}}>+ Nuova Ricetta</Btn>}
      </div>

      {showForm&&(
        <Card t={t} style={{padding:20}}>
          <div className="mono" style={{fontSize:8,letterSpacing:"0.14em",color:t.inkFaint,marginBottom:12}}>SCHEDA TECNICA</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <LuxInput value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Nome ricetta" t={t} style={{gridColumn:"1/-1"}}/>
            <LuxSelect value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} t={t}>
              {CATS_RECIPE.map(c=><option key={c} value={c}>{c.replace("_"," ").toUpperCase()}</option>)}
            </LuxSelect>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <LuxInput value={form.portions} onChange={e=>setForm(p=>({...p,portions:e.target.value}))} type="number" placeholder="Porzioni" t={t}/>
              <LuxInput value={form.menuPrice} onChange={e=>setForm(p=>({...p,menuPrice:e.target.value}))} type="number" placeholder="Prezzo menu €" t={t}/>
            </div>
          </div>
          <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:8}}>INGREDIENTI</div>
          {form.ingredients.map((ing,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 70px 60px 90px 32px",gap:6,marginBottom:6}}>
              <LuxInput value={ing.name} onChange={e=>updIngredient(i,"name",e.target.value)} placeholder="Ingrediente" t={t}/>
              <LuxInput value={ing.qty} onChange={e=>updIngredient(i,"qty",e.target.value)} type="number" placeholder="Qtà" t={t}/>
              <LuxSelect value={ing.unit} onChange={e=>updIngredient(i,"unit",e.target.value)} t={t}>
                {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </LuxSelect>
              <LuxInput value={ing.costPer} onChange={e=>updIngredient(i,"costPer",e.target.value)} type="number" placeholder="€/unità" t={t}/>
              <button onClick={()=>remIngredient(i)} style={{...btnSmall(t),color:t.danger}}>✕</button>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button onClick={addIngredient} style={{...btnSmall(t)}}>+ Ingrediente</button>
            <Btn t={t} variant="gold" onClick={saveRecipe} style={{marginLeft:"auto"}}>💾 Salva Ricetta</Btn>
          </div>
        </Card>
      )}

      {tab==="ricette"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {recipes.length===0&&!showForm&&(
            <div style={{textAlign:"center",padding:"48px 0",color:t.inkFaint}}>
              <div style={{fontFamily:"var(--serif)",fontSize:20,fontStyle:"italic",marginBottom:8}}>Nessuna ricetta</div>
              <div className="mono" style={{fontSize:9}}>CREA LA PRIMA SCHEDA TECNICA</div>
            </div>
          )}
          {recipes.map(recipe=>{
            const fc=calcFoodCost(recipe);
            const isSelected=selected===recipe.id;
            return (
              <Card key={recipe.id} t={t} style={{padding:0}}>
                <div style={{padding:"14px 20px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>setSelected(isSelected?null:recipe.id)}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:14,color:t.ink}}>{recipe.name}</div>
                    <div className="mono" style={{fontSize:8,color:t.inkFaint,marginTop:2}}>
                      {recipe.category?.replace("_"," ").toUpperCase()} · {recipe.portions} porzioni
                    </div>
                  </div>
                  {fc.pct!==null&&(
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"var(--mono)",fontSize:16,fontWeight:700,color:fcColor(fc.pct)}}>{fc.pct.toFixed(1)}%</div>
                      <div className="mono" style={{fontSize:8,color:t.inkFaint}}>FOOD COST</div>
                    </div>
                  )}
                  <div style={{textAlign:"right"}}>
                    <div className="mono" style={{fontSize:12,color:t.gold}}>€{fc.costPerPortion.toFixed(2)}</div>
                    <div className="mono" style={{fontSize:8,color:t.inkFaint}}>/ porzione</div>
                  </div>
                  <span style={{color:t.inkFaint}}>{isSelected?"▲":"▼"}</span>
                </div>
                {isSelected&&(
                  <div style={{padding:"0 20px 16px",borderTop:`1px solid ${t.div}`}}>
                    {/* Ingredienti */}
                    <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:8,marginTop:12}}>INGREDIENTI</div>
                    {(recipe.ingredients||[]).map((ing,i)=>(
                      <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${t.div}`,fontSize:12}}>
                        <span style={{flex:1,fontFamily:"var(--serif)",fontStyle:"italic",color:t.ink}}>{ing.name}</span>
                        <span className="mono" style={{color:t.inkMuted}}>{ing.qty} {ing.unit}</span>
                        <span className="mono" style={{color:t.gold}}>€{((parseFloat(ing.qty)||0)*(parseFloat(ing.costPer)||0)).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{display:"flex",gap:8,marginTop:12}}>
                      <Btn t={t} variant="ghost" onClick={()=>analyzeRecipeAI(recipe)} disabled={aiLoading} style={{fontSize:10}}>
                        🤖 Analisi AI Food Cost
                      </Btn>
                      {canEdit&&<button onClick={()=>deleteRecipe(recipe.id)} style={{...btnSmall(t),color:t.danger}}>✕ Elimina</button>}
                    </div>
                    {/* AI Analysis */}
                    {recipe.aiAnalysis&&(
                      <div style={{marginTop:12,padding:14,background:t.bgAlt,borderRadius:10}}>
                        <div className="mono" style={{fontSize:8,color:t.gold,marginBottom:8}}>🤖 ANALISI AI</div>
                        <div style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:12,color:t.ink,marginBottom:8}}>{recipe.aiAnalysis.note_chef}</div>
                        {recipe.aiAnalysis.consigli?.map((c,i)=>(
                          <div key={i} style={{fontSize:11,color:t.inkSoft,padding:"3px 0"}}>→ {c}</div>
                        ))}
                        {recipe.aiAnalysis.ingredienti_alternativi?.length>0&&(
                          <div style={{marginTop:8}}>
                            <div className="mono" style={{fontSize:7,color:t.inkFaint,marginBottom:4}}>ALTERNATIVE ECONOMICHE</div>
                            {recipe.aiAnalysis.ingredienti_alternativi.map((a,i)=>(
                              <div key={i} style={{fontSize:11,color:t.success}}>↓ {a.originale} → {a.alternativa} ({a.risparmio_pct}% risparmio)</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab==="analisi"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Sommario food cost */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {[
              {label:"Ricette totali",val:recipes.length,unit:""},
              {label:"FC medio",val:recipes.length?((recipes.reduce((s,r)=>s+(calcFoodCost(r).pct||0),0)/recipes.length)).toFixed(1):0,unit:"%"},
              {label:"Costo medio/porzione",val:recipes.length?((recipes.reduce((s,r)=>s+calcFoodCost(r).costPerPortion,0)/recipes.length)).toFixed(2):0,unit:"€"},
            ].map(({label,val,unit})=>(
              <Card key={label} t={t} style={{padding:16,textAlign:"center"}}>
                <div style={{fontSize:24,fontFamily:"var(--mono)",fontWeight:700,color:t.gold}}>{val}{unit}</div>
                <div className="mono" style={{fontSize:8,color:t.inkFaint,marginTop:4}}>{label.toUpperCase()}</div>
              </Card>
            ))}
          </div>
          {recipes.map(recipe=>{
            const fc=calcFoodCost(recipe);
            return (
              <Card key={recipe.id} t={t} style={{padding:"12px 20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontFamily:"var(--serif)",fontStyle:"italic",fontSize:13,color:t.ink,flex:1}}>{recipe.name}</span>
                  <div style={{
                    padding:"4px 10px",borderRadius:6,background:fcColor(fc.pct)+"22",
                    border:`1px solid ${fcColor(fc.pct)}44`,
                    fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:fcColor(fc.pct),
                  }}>{fc.pct!==null?`${fc.pct.toFixed(1)}%`:"—"}</div>
                  <span className="mono" style={{fontSize:10,color:t.gold}}>€{fc.costPerPortion.toFixed(2)}/pz</span>
                </div>
                {fc.pct!==null&&(
                  <div style={{marginTop:6,height:4,background:t.bgAlt,borderRadius:2}}>
                    <div style={{height:"100%",width:`${Math.min(fc.pct,60)/60*100}%`,background:fcColor(fc.pct),borderRadius:2,transition:"width 0.5s"}}/>
                  </div>
                )}
              </Card>
            );
          })}
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
                <div key={item.id} style={{padding:"13px 22px",minHeight:64,display:"flex",alignItems:"center",gap:12,borderBottom:i<catItems.length-1?`1px solid ${t.div}`:"none",opacity:item.checked?0.5:1,transition:"opacity 0.2s"}}>
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
      const text = await callAI({
        systemPrompt:`Sei un executive chef per cucine Michelin 3 stelle. Rispondi SEMPRE in italiano, conciso e professionale. Dati cucina: ${context}`,
        userContext: msg, maxTokens:500,
      });
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
  {key:"dashboard",    label:"Dashboard",   icon:"◫"},
  {key:"giacenze",     label:"Giacenze",    icon:"❄"},
  {key:"mep",          label:"MEP",         icon:"◷"},
  {key:"preparazioni", label:"Prep",        icon:"📋"},
  {key:"servizio",     label:"Servizio",    icon:"▶"},
  {key:"spesa",        label:"Spesa",       icon:"◻"},
  {key:"haccp",        label:"HACCP",       icon:"🛡"},
  {key:"foodcost",     label:"Food Cost",   icon:"📐"},
  {key:"brigata",      label:"Brigata",     icon:"★"},
  {key:"settings",     label:"Impostazioni",icon:"⊞"},
];

const SECTION_TITLE = {
  dashboard:"Command Center",giacenze:"Giacenze & Inventario",mep:"Organizzazione MEP",
  preparazioni:"Preparazioni",servizio:"Servizio Live",spesa:"Lista della Spesa",
  haccp:"HACCP & Tracciabilità",foodcost:"Food Cost & Ricette",
  brigata:"Brigata",settings:"Impostazioni",
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
  const [themeKey,    setThemeKey]    = useState(()=>{ const saved=localStorage.getItem("kp-theme"); return saved&&THEMES[saved]?saved:"carta"; });
  const [section,     setSection]     = useState("dashboard");
  const [ready,       setReady]       = useState(false);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [showAI,      setShowAI]      = useState(false);
  const [showDrawer,  setShowDrawer]  = useState(false);
  const isMobile = useIsMobile();
  const t = THEMES[themeKey]||THEMES.carta;
  const { state, kitchen } = useK();

  useEffect(()=>{ setTimeout(()=>setReady(true),60); },[]);
  useEffect(()=>{
    const fn = (e) => setSection(e.detail);
    window.addEventListener("kp-nav", fn);
    return () => window.removeEventListener("kp-nav", fn);
  },[]);
  useEffect(()=>{ localStorage.setItem("kp-theme",themeKey); },[themeKey]);

  const needsSetup = state.kitchens.length===0;
  if(needsSetup) return <><style>{CSS(t)}</style><SetupScreen t={t}/></>;

  return (
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"var(--serif)",color:t.ink,background:t.bg,transition:"background 0.6s, color 0.4s"}}>
      <style>{CSS(t)}</style>

      {/* Sidebar — nascosta su mobile via JS */}
      {!isMobile && (
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
      )}

      {/* Main */}
      <div style={{
        flex:1,
        marginLeft:isMobile?0:(sideCollapsed?68:240),
        transition:"margin-left 0.4s cubic-bezier(0.4,0,0.2,1)",
        display:"flex",flexDirection:"column",
        paddingBottom:isMobile?72:0,
      }}>
        {/* Topbar */}
        <header style={{
          padding:isMobile?"12px 16px":"16px 36px",
          background:t.bgGlass,backdropFilter:"blur(20px)",
          borderBottom:`1px solid ${t.div}`,display:"flex",
          justifyContent:"space-between",alignItems:"center",
          position:"sticky",top:0,zIndex:10,transition:"background 0.4s",
        }}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:isMobile?17:22,fontWeight:600,letterSpacing:"0.04em",color:t.ink}}>{SECTION_TITLE[section]}</div>
            {isMobile && (
              <div style={{
                padding:"3px 8px",borderRadius:6,
                background:t.accentGlow,
                fontFamily:"var(--mono)",fontSize:8,
                color:t.accent,letterSpacing:"0.08em",
              }}>
                {kitchen?.name||"★★★"}
              </div>
            )}
          </div>
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
        <main style={{flex:1,padding:isMobile?"14px 14px":"28px 36px 48px",overflow:"auto"}} key={section}>
          <div style={{animation:ready?"cardIn 0.45s cubic-bezier(0.4,0,0.2,1) both":"none"}}>
            {section==="dashboard"  && <DashboardView t={t}/>}
            {section==="giacenze"   && <InventoryView t={t}/>}
      {section==="preparazioni" && <PreparazioniView t={t}/>}
            {section==="mep"        && <MepView t={t}/>}
            {section==="spesa"      && <ShoppingView t={t}/>}
            {section==="servizio"   && <ServizioView t={t}/>}
            {section==="haccp"      && <HaccpView t={t}/>}
            {section==="foodcost"   && <FoodCostView t={t}/>}
            {section==="brigata"    && <BrigataView t={t}/>}
            {section==="settings"   && <SettingsView t={t}/>}
          </div>
        </main>
      </div>

      {/* ══ BOTTOM NAV MOBILE ══ */}
      {isMobile && (
        <>
          {/* Drawer Altro — sezioni secondarie */}
          {showDrawer && (
            <div onClick={()=>setShowDrawer(false)} style={{
              position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:199,
              background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",
            }}>
              <div onClick={e=>e.stopPropagation()} style={{
                position:"fixed",bottom:72,left:0,right:0,zIndex:200,
                background:t.bgCard,borderRadius:"20px 20px 0 0",
                boxShadow:`0 -8px 40px ${t.shadowStrong}`,
                padding:"20px 16px 8px",
                border:`1px solid ${t.div}`,
              }}>
                <div style={{width:40,height:4,background:t.div,borderRadius:2,margin:"0 auto 20px"}}/>
                <div className="mono" style={{fontSize:8,letterSpacing:"0.16em",color:t.inkFaint,marginBottom:14,paddingLeft:4}}>ALTRO</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                  {[
                    {key:"spesa",    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, label:"Spesa",      color:t.secondary},
                    {key:"haccp",    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label:"HACCP",      color:t.success},
                    {key:"foodcost", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, label:"Food Cost",  color:t.gold},
                    {key:"brigata",  icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>, label:"Brigata",    color:t.accent},
                    {key:"settings", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>, label:"Settings",   color:t.inkMuted},
                  ].map(n=>{
                    const active = section===n.key;
                    return (
                      <button key={n.key} onClick={()=>{setSection(n.key);setShowDrawer(false);}} style={{
                        padding:"18px 8px 14px",borderRadius:16,
                        border:`1px solid ${active?n.color+"55":t.div}`,
                        cursor:"pointer",
                        background:active?`linear-gradient(145deg,${n.color}22,${n.color}0a)`:t.bgAlt,
                        display:"flex",flexDirection:"column",alignItems:"center",gap:8,
                        minHeight:80,transition:"all 0.2s",
                        boxShadow:active?`0 4px 16px ${n.color}22`:"none",
                        transform:active?"scale(1.02)":"scale(1)",
                      }}>
                        <div style={{color:active?n.color:t.inkMuted,opacity:active?1:0.6}}>{n.icon}</div>
                        <span style={{
                          fontFamily:"var(--mono)",fontSize:9,
                          color:active?n.color:t.inkMuted,
                          letterSpacing:"0.06em",textAlign:"center",
                          fontWeight:active?600:400,
                        }}>{n.label}</span>
                      </button>
                    );
                  })}
                  {/* Theme switcher nel drawer */}
                  <div style={{gridColumn:"1/-1",marginTop:8,paddingTop:16,borderTop:`1px solid ${t.div}`}}>
                    <div className="mono" style={{fontSize:8,color:t.inkFaint,marginBottom:10,letterSpacing:"0.12em"}}>TEMA</div>
                    <div style={{display:"flex",gap:8}}>
                      {Object.entries(THEMES).map(([key,th])=>(
                        <button key={key} onClick={()=>setThemeKey(key)} style={{
                          flex:1,height:44,borderRadius:10,cursor:"pointer",
                          border:themeKey===key?`2px solid ${t.gold}`:`1px solid ${t.div}`,
                          background:th.bg,fontSize:16,transition:"all 0.2s",
                          boxShadow:themeKey===key?`0 0 12px ${t.goldDim}`:"none",
                          transform:themeKey===key?"scale(1.06)":"scale(1)",
                        }}>{th.icon}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Tab Bar */}
          <nav style={{
            position:"fixed",bottom:0,left:0,right:0,zIndex:100,
            background:t.bgCard,
            borderTop:`1px solid ${t.div}`,
            display:"flex",alignItems:"stretch",
            boxShadow:`0 -4px 24px ${t.shadowStrong}`,
            paddingBottom:"env(safe-area-inset-bottom, 0px)",
          }}>
            {[
              {key:"dashboard",    label:"Home",  svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>},
              {key:"giacenze",     label:"Stock", svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>},
              {key:"mep",          label:"MEP",   svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>},
              {key:"preparazioni", label:"Prep",  svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>},
              {key:"servizio",     label:"Live",  svg:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"><circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>},
            ].map(n=>{
              const active = section===n.key;
              return (
                <button key={n.key} onClick={()=>{setSection(n.key);setShowDrawer(false);}} style={{
                  flex:1,display:"flex",flexDirection:"column",
                  alignItems:"center",justifyContent:"center",
                  padding:"10px 6px 8px",border:"none",cursor:"pointer",
                  minHeight:60, background:"transparent",
                  color:active?t.accent:t.inkFaint,
                  transition:"all 0.2s",gap:4,position:"relative",
                }}>
                  {active && <div style={{
                    position:"absolute",top:0,left:"15%",right:"15%",
                    height:2,background:t.accent,
                    borderRadius:"0 0 3px 3px",
                  }}/>}
                  <div style={{
                    width:40,height:40,borderRadius:12,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    background:active?t.accentGlow:"transparent",
                    transition:"all 0.2s",
                    transform:active?"scale(1.05)":"scale(1)",
                  }}>
                    {n.svg}
                  </div>
                  <span style={{
                    fontFamily:"var(--mono)",fontSize:9,
                    letterSpacing:"0.04em",whiteSpace:"nowrap",
                    fontWeight:active?600:400,
                  }}>{n.label}</span>
                </button>
              );
            })}
            {/* Altro button */}
            <button onClick={()=>setShowDrawer(d=>!d)} style={{
              flex:1,display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",
              padding:"10px 4px 8px",border:"none",cursor:"pointer",
              minHeight:60,
              background:showDrawer?t.accentGlow:"transparent",
              color:["spesa","haccp","foodcost","brigata","settings"].includes(section)||showDrawer?t.accent:t.inkFaint,
              borderTop:["spesa","haccp","foodcost","brigata","settings"].includes(section)||showDrawer?`2px solid ${t.accent}`:"2px solid transparent",
              gap:3,transition:"all 0.2s",
            }}>
              <div style={{
                width:40,height:40,borderRadius:12,
                display:"flex",alignItems:"center",justifyContent:"center",
                background:(showDrawer||["spesa","haccp","foodcost","brigata","settings"].includes(section))?t.accentGlow:"transparent",
                transition:"all 0.2s",
                transform:showDrawer?"scale(1.05)":"scale(1)",
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22"
                  style={{transform:showDrawer?"rotate(45deg)":"rotate(0deg)",transition:"transform 0.3s"}}>
                  <circle cx="5" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                  <circle cx="19" cy="5" r="1.5" fill="currentColor"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="5" cy="19" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                  <circle cx="19" cy="19" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <span style={{fontFamily:"var(--mono)",fontSize:9,letterSpacing:"0.04em"}}>
                {["spesa","haccp","foodcost","brigata","settings"].includes(section)
                  ? NAV.find(n=>n.key===section)?.label?.slice(0,6)||"Altro"
                  : "Altro"}
              </span>
            </button>
          </nav>
        </>
      )}

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