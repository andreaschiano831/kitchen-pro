export type QuickAddUnit =
  | "kg" | "g" | "l" | "ml" | "pz"
  | "vac" | "busta" | "brik" | "latta" | "box" | "vasch";

export type QuickAddLocation = "freezer" | "fridge" | "dry" | "counter";

export type QuickAddDraft = {
  name: string;
  quantity: number;
  unit: QuickAddUnit;
  location?: QuickAddLocation;
  expiresAt?: string; // YYYY-MM-DD oppure "?"
  category?: string;  // chiave preset (proteine/pesce/...)
  notes?: string;
  section?: string;
  parLevel?: number;  // solo pz, default 5
};

const STOP_PREFIX = new Set(["del","della","dei","degli","delle","le","lo","la","i","gli","il","un","uno","una"]);

const UNIT: Record<string, QuickAddUnit> = {
  "kg":"kg","kilo":"kg","chilo":"kg","chili":"kg","kili":"kg",
  "g":"g","gr":"g","grammo":"g","grammi":"g",
  "l":"l","litro":"l","litri":"l",
  "ml":"ml",
  "pz":"pz","pezzo":"pz","pezzi":"pz","un":"pz","unita":"pz","unità":"pz",
  "vac":"vac","sv":"vac","sottovuoto":"vac",
  "busta":"busta","buste":"busta","confezione":"busta","confezioni":"busta",
  "brik":"brik","brick":"brik",
  "latta":"latta","lattina":"latta","lattine":"latta",
  "box":"box","scatola":"box","scatole":"box",
  "vasch":"vasch","vaschetta":"vasch","vaschette":"vasch",
};

const CAT_IT: Record<string, string> = {
  "proteine":"proteine",
  "pesce":"pesce",
  "verdure":"verdure",
  "erbe":"erbe",
  "latticini":"latticini",
  "cereali":"cereali",
  "grassi":"grassi",
  "fermentati":"fermentati",
  "spezie":"spezie",
  "fondi":"fondi",
  "cantina":"cantina",
  "consumabili":"consumabili",
  "default":"default",
};

function isNum(t: string) { return /^\d+(\.\d+)?$/.test(t); }

function titleCase(s: string) {
  const w = s.trim().split(/\s+/).filter(Boolean);
  const cleaned = w.filter((x, i) => !(i === 0 && STOP_PREFIX.has(x.toLowerCase())));
  return cleaned.map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(" ");
}

function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${dd}`;
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth()+1, 0);
}

function nextFriday(d: Date) {
  const day = d.getDay(); // 0..6
  const delta = (5 - day + 7) % 7;
  const add = delta === 0 ? 7 : delta;
  const x = new Date(d);
  x.setDate(d.getDate() + add);
  return x;
}

function parseExpiry(tokens: string[], i: number): { exp?: string; next: number } {
  const t = (tokens[i] || "").toLowerCase();
  const now = new Date();

  if (t === "domani") {
    const x = new Date(now);
    x.setDate(now.getDate()+1);
    return { exp: iso(x), next: i+1 };
  }

  if (t === "tra" && isNum(tokens[i+1] || "") && ((tokens[i+2]||"").toLowerCase() === "giorni" || (tokens[i+2]||"").toLowerCase() === "giorno")) {
    const n = Math.floor(Number(tokens[i+1]));
    const x = new Date(now);
    x.setDate(now.getDate()+n);
    return { exp: iso(x), next: i+3 };
  }

  if (t === "fine" && (tokens[i+1]||"").toLowerCase() === "settimana") {
    const x = nextFriday(now);
    return { exp: iso(x), next: i+2 };
  }

  if (t === "entro" && (tokens[i+1]||"").toLowerCase() === "fine" && (tokens[i+2]||"").toLowerCase() === "mese") {
    const x = endOfMonth(now);
    return { exp: iso(x), next: i+3 };
  }

  if ((t === "exp" || t === "scad" || t === "scade" || t === "scadenza") && tokens[i+1]) {
    const v = tokens[i+1];
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return { exp: v, next: i+2 };
    if (/^\d{1,2}$/.test(v)) {
      const day = Number(v);
      const x = new Date(now.getFullYear(), now.getMonth(), day);
      if (x.getTime() < now.getTime()) x.setMonth(x.getMonth()+1);
      return { exp: iso(x), next: i+2 };
    }
  }

  return { next: i };
}

function inferLocation(name: string): QuickAddLocation {
  const n = name.toLowerCase();
  const freezer = ["surgel","carne","manzo","vitello","pollo","agnello","pesce","gamber","calam","tonno","salm","astice"];
  const fridge  = ["latte","panna","burro","yogurt","uova","salume","prosci","formagg","parmig","verd","insalat"];
  const dry     = ["pasta","riso","farina","olio","spezie","sale","zucchero"];
  const counter = ["pane","frutta"];
  if (freezer.some(h => n.includes(h))) return "freezer";
  if (fridge.some(h => n.includes(h))) return "fridge";
  if (dry.some(h => n.includes(h))) return "dry";
  if (counter.some(h => n.includes(h))) return "counter";
  return "fridge";
}

function inferCategory(name: string): string {
  const n = name.toLowerCase();
  if (/(wagyu|piccione|animelle|carne|manzo|vitello|pollo|agnello|maiale)/.test(n)) return "proteine";
  if (/(pesce|rombo|capesante|ricci|polpo|astice|gamber|calam|tonno|salm)/.test(n)) return "pesce";
  if (/(topinambur|scorzonera|cavolo|verd)/.test(n)) return "verdure";
  if (/(acetosella|borragine|fiori)/.test(n)) return "erbe";
  if (/(burro|panna|uova|formagg|parmig)/.test(n)) return "latticini";
  if (/(farina|cereali|farro|semola|riso|pasta)/.test(n)) return "cereali";
  if (/(olio|lardo|grassi|chiarificato)/.test(n)) return "grassi";
  if (/(koji|miso|kombucha|ferment)/.test(n)) return "fermentati";
  if (/(pepe|sumac|cardamomo|sale|spezie)/.test(n)) return "spezie";
  if (/(fondo|dashi|bisque|glace|riduz)/.test(n)) return "fondi";
  if (/(vino|sake|distill|bevanda)/.test(n)) return "cantina";
  if (/(carta|agar|lecitina|consum)/.test(n)) return "consumabili";
  return "default";
}

function stripFiller(s: string) {
  return s.replace(/\b(allora|dunque|quindi|metti|tipo|per favore)\b/gi, "").replace(/\s+/g," ").trim();
}

function parseOne(part: string): QuickAddDraft | null {
  const raw = stripFiller(part);
  if (!raw) return null;
  const tokens = raw.split(/\s+/).filter(Boolean);

  let i = 0;
  let qty = 1.0;

  const t0 = (tokens[i] || "").toLowerCase();
  if (t0 === "mezzo" || t0 === "mezza") { qty = 0.5; i++; }
  else if (isNum(tokens[i] || "")) { qty = Number(tokens[i]); i++; }

  let unit: QuickAddUnit = "pz";
  const u = (tokens[i] || "").toLowerCase();
  if (u && UNIT[u]) { unit = UNIT[u]; i++; }

  let location: QuickAddLocation | undefined;
  let exp: string | undefined;
  let category: string | undefined;
  let notes: string | undefined;

  const nameParts: string[] = [];
  const notesParts: string[] = [];

  while (i < tokens.length) {
    const t = tokens[i].toLowerCase();

    if (t === "freezer" || t === "fridge" || t === "dry" || t === "counter") { location = t as any; i++; continue; }
    if (t === "frigo") { location = "fridge"; i++; continue; }
    if (t === "congelatore") { location = "freezer"; i++; continue; }

    const pe = parseExpiry(tokens, i);
    if (pe.next !== i) { exp = pe.exp; i = pe.next; continue; }

    if (t === "cat" || t === "categoria" || t === "category") {
      const v = tokens[i+1];
      if (v) { const vv = v.toLowerCase(); category = CAT_IT[vv] || vv; i += 2; continue; }
    }

    if (t === "note" || t === "notes") {
      notesParts.push(...tokens.slice(i+1));
      break;
    }

    nameParts.push(tokens[i]);
    i++;
  }

  const nameRaw = nameParts.join(" ").trim();
  if (!nameRaw) return null;

  const name = titleCase(nameRaw);
  if (!category) category = inferCategory(name);
  if (!location) location = inferLocation(name);
  if (!exp) exp = "?";
  if (notesParts.length) notes = titleCase(notesParts.join(" "));

  return {
    name,
    quantity: qty,
    unit,
    location,
    expiresAt: exp,
    category,
    notes,
    parLevel: unit === "pz" ? 5 : undefined,
  };
}

export function parseQuickAddText(text: string): QuickAddDraft[] {
  const lines = text.split(/\n+/).map(x => x.trim()).filter(Boolean);
  const out: QuickAddDraft[] = [];

  for (const line of lines) {
    const parts = line.split(/,\s*/).map(x => x.trim()).filter(Boolean);
    for (const part of parts) {
      const r = parseOne(part);
      if (!r) {
        out.push({ name: "⚠️ UNPARSED", quantity: 1, unit: "pz", expiresAt: "?", category: "default", notes: part });
      } else {
        out.push(r);
      }
    }
  }
  return out;
}
