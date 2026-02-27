/**
 * precheck.ts — Lightweight rule-based precheck engine.
 * Architettura pronta per AI: sostituisci runPrecheck() con una chiamata
 * a aiClient (vedi stub commentato in fondo) senza toccare la UI.
 */

export type AddSuggestion = {
  type: "add";
  name: string;
  qty: number;
  unit: string;
  location: "fridge" | "freezer" | "dry" | "counter";
};

export type AdjustSuggestion = {
  type: "adjust";
  name: string;
  delta: number;
  unit: string;
};

export type NoteSuggestion = {
  type: "note";
  text: string;
};

export type Suggestion = AddSuggestion | AdjustSuggestion | NoteSuggestion;

export type PrecheckResult = {
  adds: AddSuggestion[];
  adjusts: AdjustSuggestion[];
  notes: NoteSuggestion[];
  unparsed: string[];
};

// ── Vocabulary ─────────────────────────────────────────────────────────────────

const UNIT_MAP: Record<string, string> = {
  kg: "kg", chilo: "kg", chili: "kg",
  g: "g", gr: "g", grammi: "g",
  l: "l", lt: "l", litri: "l", litro: "l",
  ml: "ml",
  pz: "pz", pezzi: "pz", pezzo: "pz", unità: "pz",
  box: "box", scatola: "box",
  busta: "busta", buste: "busta",
  brik: "brik",
  latta: "latta", lattina: "latta",
  vasch: "vasch", vaschetta: "vasch",
  vac: "vac",
};

const LOC_MAP: Record<string, AddSuggestion["location"]> = {
  frigo: "fridge", frigorifero: "fridge", fridge: "fridge",
  freezer: "freezer", congelatore: "freezer",
  dispensa: "dry", dry: "dry",
  banco: "counter", counter: "counter",
};

// num: "2", "2.5", "2,5"
const NUM = /(\d+(?:[.,]\d+)?)/;
const UNIT = new RegExp(
  `(${Object.keys(UNIT_MAP).sort((a,b)=>b.length-a.length).join("|")})`,
  "i"
);
// "2 kg branzino" or "branzino 2 kg"
const QTY_FIRST  = new RegExp(`^${NUM.source}\\s*${UNIT.source}\\s+(.+)$`, "i");
const NAME_FIRST  = new RegExp(`^(.+?)\\s+${NUM.source}\\s*${UNIT.source}$`, "i");
const LOC_HINT    = new RegExp(`\\b(${Object.keys(LOC_MAP).join("|")})\\b`, "i");
const SCARICA_RE  = /^(scarica|consuma|usa|togli)\s+/i;
const NOTE_RE     = /^(nota|prep|preparazione|memo|promemoria)\s*[:—-]\s*/i;

function parseNum(s: string): number {
  return parseFloat(s.replace(",", "."));
}

// ── Main function ──────────────────────────────────────────────────────────────

export function runPrecheck(input: { text: string }): PrecheckResult {
  const adds: AddSuggestion[]    = [];
  const adjusts: AdjustSuggestion[] = [];
  const notes: NoteSuggestion[]  = [];
  const unparsed: string[]       = [];

  const lines = input.text
    .split(/\n|;/)
    .map(l => l.trim())
    .filter(Boolean);

  for (const raw of lines) {
    // ── Note line
    if (NOTE_RE.test(raw)) {
      notes.push({ type: "note", text: raw.replace(NOTE_RE, "").trim() });
      continue;
    }

    // ── Scarica / consuma → negative adjust
    const scaricaMatch = SCARICA_RE.exec(raw);
    if (scaricaMatch) {
      const rest = raw.slice(scaricaMatch[0].length);
      const m = QTY_FIRST.exec(rest) || NAME_FIRST.exec(rest);
      if (m) {
        const isQtyFirst = QTY_FIRST.test(rest);
        const qty  = parseNum(isQtyFirst ? m[1] : m[2]);
        const unit = UNIT_MAP[(isQtyFirst ? m[2] : m[3]).toLowerCase()] ?? "pz";
        const name = (isQtyFirst ? m[3] : m[1]).trim();
        adjusts.push({ type: "adjust", name, delta: -qty, unit });
        continue;
      }
    }

    // ── Add line (qty first or name first)
    const mQF = QTY_FIRST.exec(raw);
    const mNF = !mQF ? NAME_FIRST.exec(raw) : null;
    const m   = mQF || mNF;

    if (m) {
      const isQtyFirst = !!mQF;
      const qty  = parseNum(isQtyFirst ? m[1] : m[2]);
      const unit = UNIT_MAP[(isQtyFirst ? m[2] : m[3]).toLowerCase()] ?? "pz";
      const name = (isQtyFirst ? m[3] : m[1]).trim();
      const locHint = LOC_HINT.exec(raw);
      const location = locHint ? (LOC_MAP[locHint[1].toLowerCase()] ?? "fridge") : "fridge";
      adds.push({ type: "add", name, qty, unit, location });
      continue;
    }

    unparsed.push(raw);
  }

  return { adds, adjusts, notes, unparsed };
}

// ── AI stub ────────────────────────────────────────────────────────────────────
// Per attaccare un modello AI, sostituisci runPrecheck con questa funzione:
//
// export async function runPrecheckAI(input: { text: string }): Promise<PrecheckResult> {
//   const res = await aiClient.messages.create({
//     model: "claude-sonnet-4-20250514",
//     max_tokens: 1024,
//    system: "Sei un assistente cucina. Estrai aggiun-te e rettifiche giacenze dal testo. Rispondi JSON: {adds:[{name,qty,unit,location}], adjusts:[{name,delta,unit}], notes:[{text}]}",
//     messages: [{ role: "user", content: input.text }],
//   });
//   return JSON.parse((res.content[0] as any).text);
// }
