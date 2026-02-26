/**
 * precheck.ts — Pre-check IA leggero (NO API esterne)
 * Parser deterministico: testo libero → proposte modifiche giacenze/prep
 *
 * Formati supportati:
 *   "scarica 2kg manzo"
 *   "carica 6 pz uova"
 *   "sposta 3 pz piccione in freezer"
 *   "prep: fondo bruno 5L"
 *   "consuma 500g burro"
 */

import type { Location, Unit } from "../types/freezer";

// ── Types ──────────────────────────────────────────────────────────────────────

export type StockDelta = {
  action: "carica" | "scarica" | "sposta" | "consuma";
  name: string;
  qty: number;
  unit: Unit;
  toLocation?: Location;
  raw: string;
};

export type PrepNote = {
  description: string;
  raw: string;
};

export type PrecheckResult = {
  stockDeltas: StockDelta[];
  prepNotes: PrepNote[];
  unparsed: string[];
};

// ── Vocabulary ─────────────────────────────────────────────────────────────────

const UNIT_RE = /(\d+(?:[.,]\d+)?)\s*(kg|g|gr|l|lt|ml|pz|pezzi?|box|busta|brik|latta|vasch|vac)/i;

const UNIT_MAP: Record<string, Unit> = {
  kg: "kg", g: "g", gr: "g", l: "l", lt: "l", ml: "ml",
  pz: "pz", pezzi: "pz", pezzo: "pz",
  box: "box", busta: "busta", brik: "brik", latta: "latta",
  vasch: "vasch", vac: "vac",
};

const LOC_MAP: Record<string, Location> = {
  freezer: "freezer", congelatore: "freezer", frigo: "fridge",
  frigorifero: "fridge", fridge: "fridge", dispensa: "dry", dry: "dry",
  banco: "counter", counter: "counter",
};

function parseUnit(raw: string): { qty: number; unit: Unit } | null {
  const m = UNIT_RE.exec(raw);
  if (!m) return null;
  const qty = parseFloat(m[1].replace(",", "."));
  const unit = UNIT_MAP[m[2].toLowerCase()] ?? "pz";
  return { qty, unit };
}

function parseLoc(line: string): Location | undefined {
  const m = /\b(in\s+)?(freezer|congelatore|frigo(?:rifero)?|fridge|dispensa|dry|banco|counter)\b/i.exec(line);
  if (!m) return undefined;
  return LOC_MAP[m[2].toLowerCase()];
}

function extractName(line: string): string {
  return line
    .replace(UNIT_RE, "")
    .replace(/\b(in\s+)?(freezer|congelatore|frigo(?:rifero)?|fridge|dispensa|dry|banco|counter)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Main parser ────────────────────────────────────────────────────────────────

export function parsePrecheckText(text: string): PrecheckResult {
  const stockDeltas: StockDelta[] = [];
  const prepNotes: PrepNote[] = [];
  const unparsed: string[] = [];

  const lines = text
    .split(/\n|;/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const raw of lines) {
    const lower = raw.toLowerCase();

    // prep: / preparazione:
    if (/^prep(?:arazione)?:/i.test(raw)) {
      prepNotes.push({ description: raw.replace(/^prep(?:arazione)?:\s*/i, "").trim(), raw });
      continue;
    }

    // carica / scarica / sposta / consuma
    const actionMatch =
      /^(carica|scaric[ao]|sposta|consum[ao]|usa|togli|aggiungi|metti)\b/i.exec(lower);

    if (!actionMatch) {
      unparsed.push(raw);
      continue;
    }

    const verb = actionMatch[1].toLowerCase();
    const action: StockDelta["action"] =
      verb === "carica" || verb === "aggiungi" || verb === "metti"
        ? "carica"
        : verb.startsWith("scaric") || verb === "togli"
        ? "scarica"
        : verb === "sposta"
        ? "sposta"
        : "consuma";

    const rest = raw.slice(actionMatch[0].length).trim();
    const parsed = parseUnit(rest);

    if (!parsed) {
      unparsed.push(raw);
      continue;
    }

    const nameRaw = rest;
    const name = extractName(nameRaw);
    const toLocation = parseLoc(raw);

    if (!name) {
      unparsed.push(raw);
      continue;
    }

    stockDeltas.push({ action, name, qty: parsed.qty, unit: parsed.unit, toLocation, raw });
  }

  return { stockDeltas, prepNotes, unparsed };
}
