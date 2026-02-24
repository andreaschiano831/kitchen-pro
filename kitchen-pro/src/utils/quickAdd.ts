export type QuickAddDraft = {
  name: string;
  quantity: number; // decimale con .
  unit: "kg" | "g" | "l" | "ml" | "pz" | "vac" | "busta" | "brik" | "latta" | "box" | "vasch";
  location?: "freezer" | "fridge" | "dry" | "counter";
  expiresAt?: string; // YYYY-MM-DD o "?"
  category?: "meat" | "fish" | "dairy" | "egg" | "veg" | "fruit" | "bakery" | "pasta" | "sauce" | "oil" | "spice" | "beverage" | "prepared" | "condiment" | "other";
  notes?: string;
  section?: string;
  parLevel?: number; // solo pz, default 5
};

const STOP_PREFIX = new Set([
  "del","della","dei","degli","delle","le","lo","la","i","gli","il","un","uno","una",
]);

const UNIT_SYNONYMS: Record<string, QuickAddDraft["unit"]> = {
  "kg":"kg","kilo":"kg","kili":"kg","chilo":"kg","chili":"kg",
  "g":"g","gr":"g","grammo":"g","grammi":"g",
  "l":"l","litro":"l","litri":"l",
  "ml":"ml",
  "pz":"pz","pezzi":"pz","pezzo":"pz","un":"pz","unità":"pz","unita":"pz",
  "vac":"vac","sv":"vac","sottovuoto":"vac",
  "busta":"busta","buste":"busta","confezione":"busta","confezioni":"busta",
  "brik":"brik","brick":"brik",
  "latta":"latta","lattina":"latta","lattine":"latta",
  "box":"box","scatola":"box","scatole":"box",
  "vasch":"vasch","vaschetta":"vasch","vaschette":"vasch",
};

function isNumberToken(t: string) {
  return /^(\d+(\.\d+)?)$/.test(t);
}

function titleCase(s: string) {
  const w = s.split(/\s+/).filter(Boolean);
  const cleaned = w.filter((x, i) => !(i === 0 && STOP_PREFIX.has(x.toLowerCase())));
  return cleaned.map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(" ");
}

function endOfMonth(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return x;
}

function nextFriday(d: Date) {
  // 0=Sun ... 5=Fri
  const day = d.getDay();
  const delta = (5 - day + 7) % 7;
  const add = delta === 0 ? 7 : delta;
  const x = new Date(d);
  x.setDate(d.getDate() + add);
  return x;
}

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function parseExpiry(tokens: string[], i: number): { exp?: string; next: number } {
  const t = tokens[i]?.toLowerCase();

  const now = new Date();

  // "domani"
  if (t === "domani") {
    const x = new Date(now);
    x.setDate(now.getDate() + 1);
    return { exp: isoDate(x), next: i + 1 };
  }

  // "tra X giorni"
  if (t === "tra" && tokens[i + 1] && isNumberToken(tokens[i + 1]) && (tokens[i + 2]?.toLowerCase() === "giorni" || tokens[i + 2]?.toLowerCase() === "giorno")) {
    const n = Math.floor(Number(tokens[i + 1]));
    const x = new Date(now);
    x.setDate(now.getDate() + n);
    return { exp: isoDate(x), next: i + 3 };
  }

  // "fine settimana" -> venerdì prossimo
  if (t === "fine" && tokens[i + 1]?.toLowerCase() === "settimana") {
    const x = nextFriday(now);
    return { exp: isoDate(x), next: i + 2 };
  }

  // "entro fine mese"
  if (t === "entro" && tokens[i + 1]?.toLowerCase() === "fine" && tokens[i + 2]?.toLowerCase() === "mese") {
    const x = endOfMonth(now);
    return { exp: isoDate(x), next: i + 3 };
  }

  // "scade il 2026-02-28" o "exp 2026-02-28"
  const maybe = tokens[i + 1];
  if ((t === "exp" || t === "scad" || t === "scade" || t === "scadenza") && maybe) {
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(maybe)) return { exp: maybe, next: i + 2 };

    // solo giorno: "il 28" -> mese corrente o prossimo
    if (/^\d{1,2}$/.test(maybe)) {
      const day = Number(maybe);
      const x = new Date(now.getFullYear(), now.getMonth(), day);
      if (x.getTime() < now.getTime()) x.setMonth(x.getMonth() + 1);
      return { exp: isoDate(x), next: i + 2 };
    }
  }

  return { next: i };
}

function inferLocation(name: string): QuickAddDraft["location"] {
  const n = name.toLowerCase();

  const freezerHints = ["surgel", "gelato", "carne", "manzo", "vitello", "pollo", "pesce", "gamber", "calam", "tonno", "salm"];
  const fridgeHints = ["latte", "panna", "burro", "yogurt", "uova", "salume", "prosci", "formagg", "verdur", "insalat"];
  const dryHints = ["pasta", "riso", "farina", "olio", "spezie", "sale", "zucchero"];
  const counterHints = ["pane", "frutta"];

  if (freezerHints.some((h) => n.includes(h))) return "freezer";
  if (fridgeHints.some((h) => n.includes(h))) return "fridge";
  if (dryHints.some((h) => n.includes(h))) return "dry";
  if (counterHints.some((h) => n.includes(h))) return "counter";
  return "fridge";
}

function inferCategory(name: string): QuickAddDraft["category"] {
  const n = name.toLowerCase();
  if (/(manzo|vitello|pollo|agnello|maiale|carne)/.test(n)) return "meat";
  if (/(pesce|gamber|calam|tonno|salm|orata|branz)/.test(n)) return "fish";
  if (/(latte|panna|burro|yogurt|formagg|parmig)/.test(n)) return "dairy";
  if (/(uov)/.test(n)) return "egg";
  if (/(insalat|verd|pomodor|zucchin|melanz)/.test(n)) return "veg";
  if (/(frutta|mela|pera|fragol|limon|aranc)/.test(n)) return "fruit";
  if (/(pane|brioche|croissant|farin)/.test(n)) return "bakery";
  if (/(pasta|riso)/.test(n)) return "pasta";
  if (/(salsa|ragù|ragu|fondo|brodo)/.test(n)) return "sauce";
  if (/(olio)/.test(n)) return "oil";
  if (/(pepe|sale|spezie)/.test(n)) return "spice";
  if (/(vino|birra|acqua|bevanda)/.test(n)) return "beverage";
  if (/(prep|prepar|base|mise)/.test(n)) return "prepared";
  if (/(senape|ketchup|maion|condim)/.test(n)) return "condiment";
  return "other";
}

function stripFiller(s: string) {
  return s
    .replace(/\b(allora|dunque|quindi|metti|tipo|per favore)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseOne(line: string): QuickAddDraft | { unparsed: string } {
  const raw = stripFiller(line);
  if (!raw) return { unparsed: "" };

  // Split in tokens
  const tokens = raw.split(/\s+/);

  let i = 0;
  let qty = 1.0;

  // qty: numero o "mezzo"
  const t0 = tokens[i]?.toLowerCase();
  if (t0 === "mezzo" || t0 === "mezza") {
    qty = 0.5; i++;
  } else if (isNumberToken(tokens[i])) {
    qty = Number(tokens[i]); i++;
  }

  // unit
  let unit: QuickAddDraft["unit"] = "pz";
  const u = tokens[i]?.toLowerCase();
  if (u && UNIT_SYNONYMS[u]) { unit = UNIT_SYNONYMS[u]; i++; }

  // parse rest: location/exp/category/notes
  let loc: QuickAddDraft["location"] | undefined;
  let exp: string | undefined;
  let cat: QuickAddDraft["category"] | undefined;
  let notes: string | undefined;

  const nameParts: string[] = [];
  const notesParts: string[] = [];

  while (i < tokens.length) {
    const t = tokens[i].toLowerCase();

    // location explicit
    if (t in { "freezer":1, "fridge":1, "dry":1, "counter":1 }) {
      loc = t as any; i++; continue;
    }
    if (t == "frigo") { loc = "fridge"; i++; continue; }
    if (t == "congelatore") { loc = "freezer"; i++; continue; }

    // expiry
    const parsed = parseExpiry(tokens, i);
    if (parsed.next != i) {
      exp = parsed.exp;
      i = parsed.next;
      continue;
    }

    // category explicit
    if (t == "category" or t == "cat" or t == "categoria") {
      const v = tokens[i+1];
      if (v) { cat = v.toLowerCase() as any; i += 2; continue; }
    }

    // notes begin
    if (t == "note" or t == "notes") {
      notesParts.extend(tokens[i+1:])
      break
    }

    nameParts.push(tokens[i]); i++;
  }

  const nameRaw = nameParts.join(" ").trim();
  if (!nameRaw) return { unparsed: line };

  const name = titleCase(nameRaw);
  if (!cat) cat = inferCategory(name);
  if (!loc) loc = inferLocation(name);
  if (!exp) exp = "?";
  if (notesParts.length) notes = titleCase(notesParts.join(" "));

  const parLevel = unit == "pz" ? 5 : undefined;

  return {
    name,
    quantity: qty,
    unit,
    location: loc,
    expiresAt: exp,
    category: cat,
    notes,
    parLevel,
  };
}

export function parseQuickAddText(text: string): QuickAddDraft[] {
  const lines = text.split(/\n+/).map((x) => x.trim()).filter(Boolean);
  const out: QuickAddDraft[] = [];

  for (const l of lines) {
    // prova split su virgole per dettati "A, B, C"
    const parts = l.split(/,\s*/).map((x) => x.trim()).filter(Boolean);
    for (const part of parts) {
      const r = parseOne(part);
      if ("unparsed" in r) {
        if (r.unparsed) out.push({ name: "⚠️ UNPARSED", quantity: 1, unit: "pz", expiresAt: "?", category: "other", notes: r.unparsed });
      } else {
        out.push(r);
      }
    }
  }
  return out;
}
