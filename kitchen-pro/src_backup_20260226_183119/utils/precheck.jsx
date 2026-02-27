"use strict";
/**
 * precheck.ts — Lightweight rule-based precheck engine.
 * Architettura pronta per AI: sostituisci runPrecheck() con una chiamata
 * a aiClient (vedi stub commentato in fondo) senza toccare la UI.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPrecheck = runPrecheck;
// ── Vocabulary ─────────────────────────────────────────────────────────────────
var UNIT_MAP = {
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
var LOC_MAP = {
    frigo: "fridge", frigorifero: "fridge", fridge: "fridge",
    freezer: "freezer", congelatore: "freezer",
    dispensa: "dry", dry: "dry",
    banco: "counter", counter: "counter",
};
// num: "2", "2.5", "2,5"
var NUM = /(\d+(?:[.,]\d+)?)/;
var UNIT = new RegExp("(".concat(Object.keys(UNIT_MAP).sort(function (a, b) { return b.length - a.length; }).join("|"), ")"), "i");
// "2 kg branzino" or "branzino 2 kg"
var QTY_FIRST = new RegExp("^".concat(NUM.source, "\\s*").concat(UNIT.source, "\\s+(.+)$"), "i");
var NAME_FIRST = new RegExp("^(.+?)\\s+".concat(NUM.source, "\\s*").concat(UNIT.source, "$"), "i");
var LOC_HINT = new RegExp("\\b(".concat(Object.keys(LOC_MAP).join("|"), ")\\b"), "i");
var SCARICA_RE = /^(scarica|consuma|usa|togli)\s+/i;
var NOTE_RE = /^(nota|prep|preparazione|memo|promemoria)\s*[:—-]\s*/i;
function parseNum(s) {
    return parseFloat(s.replace(",", "."));
}
// ── Main function ──────────────────────────────────────────────────────────────
function runPrecheck(input) {
    var _a, _b, _c;
    var adds = [];
    var adjusts = [];
    var notes = [];
    var unparsed = [];
    var lines = input.text
        .split(/\n|;/)
        .map(function (l) { return l.trim(); })
        .filter(Boolean);
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var raw = lines_1[_i];
        // ── Note line
        if (NOTE_RE.test(raw)) {
            notes.push({ type: "note", text: raw.replace(NOTE_RE, "").trim() });
            continue;
        }
        // ── Scarica / consuma → negative adjust
        var scaricaMatch = SCARICA_RE.exec(raw);
        if (scaricaMatch) {
            var rest = raw.slice(scaricaMatch[0].length);
            var m_1 = QTY_FIRST.exec(rest) || NAME_FIRST.exec(rest);
            if (m_1) {
                var isQtyFirst = QTY_FIRST.test(rest);
                var qty = parseNum(isQtyFirst ? m_1[1] : m_1[2]);
                var unit = (_a = UNIT_MAP[(isQtyFirst ? m_1[2] : m_1[3]).toLowerCase()]) !== null && _a !== void 0 ? _a : "pz";
                var name_1 = (isQtyFirst ? m_1[3] : m_1[1]).trim();
                adjusts.push({ type: "adjust", name: name_1, delta: -qty, unit: unit });
                continue;
            }
        }
        // ── Add line (qty first or name first)
        var mQF = QTY_FIRST.exec(raw);
        var mNF = !mQF ? NAME_FIRST.exec(raw) : null;
        var m = mQF || mNF;
        if (m) {
            var isQtyFirst = !!mQF;
            var qty = parseNum(isQtyFirst ? m[1] : m[2]);
            var unit = (_b = UNIT_MAP[(isQtyFirst ? m[2] : m[3]).toLowerCase()]) !== null && _b !== void 0 ? _b : "pz";
            var name_2 = (isQtyFirst ? m[3] : m[1]).trim();
            var locHint = LOC_HINT.exec(raw);
            var location_1 = locHint ? ((_c = LOC_MAP[locHint[1].toLowerCase()]) !== null && _c !== void 0 ? _c : "fridge") : "fridge";
            adds.push({ type: "add", name: name_2, qty: qty, unit: unit, location: location_1 });
            continue;
        }
        unparsed.push(raw);
    }
    return { adds: adds, adjusts: adjusts, notes: notes, unparsed: unparsed };
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
