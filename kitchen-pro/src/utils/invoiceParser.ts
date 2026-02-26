/**
 * invoiceParser.ts — Parser testo OCR fattura → righe prodotto/qty/unit/lotto
 *
 * Formati attesi (testo OCR tipico da fattura italiana):
 *   "Manzo scottona kg 10,5 Lotto AB123 Sc. 2026-03-01"
 *   "Uova fresche cat.A 6 pz"
 *   "Burro 82% 500 g L240225A1"
 *   "Branzino intero 3,5 kg 04/2026"
 */

import type { Unit } from "../types/freezer";

// ── Types ──────────────────────────────────────────────────────────────────────

export type InvoiceLine = {
  raw: string;           // riga originale
  nameGuess: string;     // nome prodotto dedotto
  qty: number;
  unitGuess: Unit;
  lotGuess: string;      // lotto se trovato, altrimenti ""
  expiresGuess: string;  // YYYY-MM-DD se trovato, altrimenti ""
};

// ── Regexes ────────────────────────────────────────────────────────────────────

// number: "10", "10,5", "10.5"
const NUM_RE  = /(\d+(?:[.,]\d+)?)/;
const UNIT_RE = new RegExp(
  NUM_RE.source + "\\s*(kg|g|gr|l|lt|ml|pz|pezzi?|box|busta|brik|latta|vasch)",
  "i"
);

const UNIT_MAP: Record<string, Unit> = {
  kg: "kg", g: "g", gr: "g", l: "l", lt: "l", ml: "ml",
  pz: "pz", pezzi: "pz", pezzo: "pz",
  box: "box", busta: "busta", brik: "brik", latta: "latta", vasch: "vasch",
};

// lotto: "Lotto ABC123", "L. ABC123", "LOT ABC", "L240225A1" (standalone code)
const LOT_RE = /\b(?:lotto?\.?\s*|LOT\.?\s*)([A-Z0-9\-]{3,20})\b/i;

// scadenza: "Sc. 2026-03-01", "Scad. 03/2026", "04/2026", "2026-03"
const EXP_RE =
  /(?:sc(?:ad)?\.?\s*)?(\d{4}-\d{2}-\d{2}|\d{2}\/\d{4}|\d{4}-\d{2})/i;

// ── Helpers ────────────────────────────────────────────────────────────────────

function normalizeDate(raw: string): string {
  // "03/2026" → "2026-03-01"
  const mm_yyyy = /^(\d{2})\/(\d{4})$/.exec(raw);
  if (mm_yyyy) return `${mm_yyyy[2]}-${mm_yyyy[1]}-01`;
  // "2026-03" → "2026-03-01"
  const yyyy_mm = /^(\d{4})-(\d{2})$/.exec(raw);
  if (yyyy_mm) return `${yyyy_mm[1]}-${yyyy_mm[2]}-01`;
  return raw; // already YYYY-MM-DD
}

function extractName(line: string): string {
  return line
    .replace(UNIT_RE, "")
    .replace(LOT_RE, "")
    .replace(EXP_RE, "")
    .replace(/\b(?:lotto?|sc(?:ad)?)\b\.?/gi, "")
    .replace(/[^\w\s'àèéìòùÀÈÉÌÒÙ%.,/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Main ───────────────────────────────────────────────────────────────────────

export function parseInvoice(text: string, date?: string): InvoiceLine[] {
  const today = date ?? new Date().toISOString().slice(0, 10);
  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3); // skip empty/header fragments

  return lines.map((raw): InvoiceLine => {
    const unitMatch = UNIT_RE.exec(raw);
    const qty   = unitMatch ? parseFloat(unitMatch[1].replace(",", ".")) : 1;
    const unit  = unitMatch ? (UNIT_MAP[unitMatch[2].toLowerCase()] ?? "pz") : "pz";

    const lotMatch = LOT_RE.exec(raw);
    const lotGuess = lotMatch ? lotMatch[1].toUpperCase() : "";

    const expMatch   = EXP_RE.exec(raw);
    const expiresGuess = expMatch ? normalizeDate(expMatch[1]) : "";

    const nameGuess = extractName(raw) || raw.slice(0, 40);

    return { raw, nameGuess, qty, unitGuess: unit, lotGuess, expiresGuess };
  });
}
