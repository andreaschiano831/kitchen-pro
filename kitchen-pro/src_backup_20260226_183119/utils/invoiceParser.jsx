"use strict";
/**
 * invoiceParser.ts — Parser testo OCR fattura → righe prodotto/qty/unit/lotto
 *
 * Formati attesi (testo OCR tipico da fattura italiana):
 *   "Manzo scottona kg 10,5 Lotto AB123 Sc. 2026-03-01"
 *   "Uova fresche cat.A 6 pz"
 *   "Burro 82% 500 g L240225A1"
 *   "Branzino intero 3,5 kg 04/2026"
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInvoice = parseInvoice;
// ── Regexes ────────────────────────────────────────────────────────────────────
// number: "10", "10,5", "10.5"
var NUM_RE = /(\d+(?:[.,]\d+)?)/;
var UNIT_RE = new RegExp(NUM_RE.source + "\\s*(kg|g|gr|l|lt|ml|pz|pezzi?|box|busta|brik|latta|vasch)", "i");
var UNIT_MAP = {
    kg: "kg", g: "g", gr: "g", l: "l", lt: "l", ml: "ml",
    pz: "pz", pezzi: "pz", pezzo: "pz",
    box: "box", busta: "busta", brik: "brik", latta: "latta", vasch: "vasch",
};
// lotto: "Lotto ABC123", "L. ABC123", "LOT ABC", "L240225A1" (standalone code)
var LOT_RE = /\b(?:lotto?\.?\s*|LOT\.?\s*)([A-Z0-9-]{3,20})\b/i;
// scadenza: "Sc. 2026-03-01", "Scad. 03/2026", "04/2026", "2026-03"
var EXP_RE = /(?:sc(?:ad)?\.?\s*)?(\d{4}-\d{2}-\d{2}|\d{2}\/\d{4}|\d{4}-\d{2})/i;
// ── Helpers ────────────────────────────────────────────────────────────────────
function normalizeDate(raw) {
    // "03/2026" → "2026-03-01"
    var mm_yyyy = /^(\d{2})\/(\d{4})$/.exec(raw);
    if (mm_yyyy)
        return "".concat(mm_yyyy[2], "-").concat(mm_yyyy[1], "-01");
    // "2026-03" → "2026-03-01"
    var yyyy_mm = /^(\d{4})-(\d{2})$/.exec(raw);
    if (yyyy_mm)
        return "".concat(yyyy_mm[1], "-").concat(yyyy_mm[2], "-01");
    return raw; // already YYYY-MM-DD
}
function extractName(line) {
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
function parseInvoice(text, _date) {
    var lines = text
        .split(/\n/)
        .map(function (l) { return l.trim(); })
        .filter(function (l) { return l.length > 3; }); // skip empty/header fragments
    return lines.map(function (raw) {
        var _a;
        var unitMatch = UNIT_RE.exec(raw);
        var qty = unitMatch ? parseFloat(unitMatch[1].replace(",", ".")) : 1;
        var unit = unitMatch ? ((_a = UNIT_MAP[unitMatch[2].toLowerCase()]) !== null && _a !== void 0 ? _a : "pz") : "pz";
        var lotMatch = LOT_RE.exec(raw);
        var lotGuess = lotMatch ? lotMatch[1].toUpperCase() : "";
        var expMatch = EXP_RE.exec(raw);
        var expiresGuess = expMatch ? normalizeDate(expMatch[1]) : "";
        var nameGuess = extractName(raw) || raw.slice(0, 40);
        return { raw: raw, nameGuess: nameGuess, qty: qty, unitGuess: unit, lotGuess: lotGuess, expiresGuess: expiresGuess };
    });
}
