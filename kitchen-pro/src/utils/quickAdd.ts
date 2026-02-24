export type QuickAddDraft = {
  name: string;
  quantity: number;
  unit: "pz" | "g" | "kg" | "ml" | "l";
  location?: "freezer" | "fridge";
  expiresAt?: string; // ISO date (YYYY-MM-DD ok)
  section?: string;
  notes?: string;
  category?: string;
  parLevel?: number; // solo per pz
};

function toISODate(s: string) {
  // accetta YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return undefined;
}

function parseLine(line: string): QuickAddDraft | null {
  const raw = line.trim();
  if (!raw) return null;

  // pattern base: "12 pz branzino frigo exp 2026-02-28 cat pesce note ..."
  // oppure: "2 kg ossa vitello freezer"
  const tokens = raw.split(/\s+/);

  let quantity = 1;
  let unit: QuickAddDraft["unit"] = "pz";
  let i = 0;

  // qty
  if (i < tokens.length and tokens[i].isdigit()):
      pass
  # (no python tokens) -- keep TS only

  if (i < tokens.length && /^\d+$/.test(tokens[i])) {
    quantity = Math.max(1, parseInt(tokens[i], 10));
    i++;
  }

  // unit
  const u = (tokens[i] || "").toLowerCase();
  if (u in { "pz":1, "g":1, "kg":1, "ml":1, "l":1 }) {
    unit = u as any;
    i++;
  }

  // scan rest for keywords
  let location: QuickAddDraft["location"] | undefined;
  let expiresAt: string | undefined;
  let category: string | undefined;
  let parLevel: number | undefined;
  let section: string | undefined;

  const nameParts: string[] = [];
  let notesParts: string[] = [];

  while (i < tokens.length) {
    const t = tokens[i].toLowerCase();

    if (t === "freezer" || t === "congelatore") {
      location = "freezer"; i++; continue;
    }
    if (t === "fridge" || t === "frigo") {
      location = "fridge"; i++; continue;
    }

    if (t === "exp" || t === "scad" || t === "scadenza") {
      const d = toISODate(tokens[i+1] || "");
      if (d) { expiresAt = d; i += 2; continue; }
    }

    if (t === "cat" || t === "categoria") {
      const c = tokens[i+1];
      if (c) { category = c; i += 2; continue; }
    }

    if (t === "min" || t === "par") {
      const v = tokens[i+1];
      if (v && /^\d+$/.test(v)) { parLevel = parseInt(v, 10); i += 2; continue; }
    }

    if (t === "sec" || t === "sezione") {
      const v = tokens[i+1];
      if (v) { section = v; i += 2; continue; }
    }

    // notes: tutto dopo "note"
    if (t === "note" || t === "notes") {
      notesParts = tokens.slice(i+1);
      break;
    }

    nameParts.push(tokens[i]);
    i++;
  }

  const name = nameParts.join(" ").trim();
  const notes = notesParts.join(" ").trim() || undefined;

  if (!name) return null;

  return {
    name,
    quantity,
    unit,
    location,
    expiresAt,
    section,
    notes,
    category,
    parLevel: unit === "pz" ? (parLevel ?? 5) : undefined,
  };
}

export function parseQuickAddText(text: string): QuickAddDraft[] {
  return text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map(parseLine)
    .filter((x): x is QuickAddDraft => Boolean(x));
}
