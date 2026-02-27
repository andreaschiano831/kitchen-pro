"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportKitchenReportDoc = exportKitchenReportDoc;
function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
function esc(s) {
    return String(s !== null && s !== void 0 ? s : "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function hoursUntil(iso) {
    if (!iso)
        return null;
    var t = Date.parse(iso);
    if (Number.isNaN(t))
        return null;
    return Math.floor((t - Date.now()) / (1000 * 60 * 60));
}
function minStock(item) {
    var unit = String(item.unit || "pz");
    if (unit !== "pz")
        return null;
    var v = item.parLevel;
    if (v === undefined || v === null)
        return 5;
    var n = Math.floor(Number(v));
    if (!Number.isFinite(n) || n <= 0)
        return 5;
    return n;
}
function catTitle(c) {
    if (c === "economato")
        return "Economato";
    if (c === "giornaliero")
        return "Giornaliera";
    return "Settimanale";
}
function exportKitchenReportDoc(kitchen, filename) {
    if (filename === void 0) { filename = "kitchen-report.doc"; }
    var now = new Date();
    var stamp = now.toISOString().slice(0, 16).replace("T", " ");
    var inv = (kitchen.freezer || []).slice();
    inv.sort(function (a, b) {
        var ad = a.expiresAt ? Date.parse(a.expiresAt) : Infinity;
        var bd = b.expiresAt ? Date.parse(b.expiresAt) : Infinity;
        if (ad !== bd)
            return ad - bd;
        var ai = a.insertedAt ? Date.parse(a.insertedAt) : 0;
        var bi = b.insertedAt ? Date.parse(b.insertedAt) : 0;
        return bi - ai;
    });
    var urgent = inv.filter(function (it) {
        var h = hoursUntil(it.expiresAt);
        return h !== null && h <= 72;
    });
    var low = inv.filter(function (it) {
        var ms = minStock(it);
        return ms !== null && Number(it.quantity) < Number(ms);
    });
    var byLoc = function (loc) { return inv.filter(function (it) { return String(it.location || "freezer") === loc; }); };
    var shopping = (kitchen.shopping || []).slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    var shopBy = function (c) { return shopping.filter(function (x) { return x.category === c; }); };
    var css = "\n    body { font-family: Calibri, Arial, sans-serif; color: #111; }\n    h1 { font-size: 18pt; margin: 0 0 6px; }\n    h2 { font-size: 13pt; margin: 16px 0 6px; }\n    .meta { color:#555; font-size: 10pt; margin: 0 0 12px; }\n    table { border-collapse: collapse; width: 100%; }\n    th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 10.5pt; }\n    th { background: #f6f6f6; text-align: left; }\n    .tag { display:inline-block; padding:2px 6px; border-radius:999px; font-size:9pt; border:1px solid #ddd; }\n    .tag-red { border-color:#ef4444; background:#fee2e2; }\n    .tag-amber { border-color:#f59e0b; background:#fffbeb; }\n    .tag-low { border-color:#dc2626; background:#fef2f2; font-weight:700; }\n    .small { color:#555; font-size:9.5pt; }\n  ";
    function invRows(items) {
        return items
            .map(function (it) {
            var h = hoursUntil(it.expiresAt);
            var ms = minStock(it);
            var lowTag = ms !== null && Number(it.quantity) < Number(ms)
                ? "<span class=\"tag tag-low\">LOW (MIN ".concat(ms, ")</span>")
                : "";
            var expTag = "";
            if (h !== null) {
                if (h <= 0)
                    expTag = "<span class=\"tag tag-red\">SCADUTO/OGGI</span>";
                else if (h <= 24)
                    expTag = "<span class=\"tag tag-red\">&lt;24h</span>";
                else if (h <= 72)
                    expTag = "<span class=\"tag tag-amber\">&lt;72h</span>";
            }
            return "\n          <tr>\n            <td>".concat(esc(it.name), "</td>\n            <td>").concat(esc(it.quantity), " ").concat(esc(it.unit), "</td>\n            <td>").concat(esc(it.section || ""), "</td>\n            <td>").concat(esc(it.expiresAt ? it.expiresAt.slice(0, 10) : ""), "</td>\n            <td>").concat(lowTag, " ").concat(expTag, "</td>\n          </tr>\n        ");
        })
            .join("");
    }
    function shopRows(items) {
        return items
            .map(function (it) { return "\n        <tr>\n          <td>".concat(esc(it.checked ? "✓" : ""), "</td>\n          <td>").concat(esc(it.name), "</td>\n          <td>").concat(esc(it.quantity), " ").concat(esc(it.unit), "</td>\n          <td>").concat(esc(it.notes || ""), "</td>\n        </tr>\n      "); })
            .join("");
    }
    function shopTable(cat) {
        var items = shopBy(cat);
        return "\n      <h2>Lista Spesa \u2014 ".concat(esc(catTitle(cat)), "</h2>\n      <table>\n        <thead><tr><th>OK</th><th>Prodotto</th><th>Qty</th><th>Note</th></tr></thead>\n        <tbody>").concat(items.length ? shopRows(items) : "<tr><td colspan=\"4\" class=\"small\">Vuota</td></tr>", "</tbody>\n      </table>\n    ");
    }
    var html = "<!doctype html>\n<html><head><meta charset=\"utf-8\"><title>".concat(esc(kitchen.name), " Report</title>\n<style>").concat(css, "</style></head>\n<body>\n  <h1>").concat(esc(kitchen.name), " \u2014 Report Cucina</h1>\n  <div class=\"meta\">Export: ").concat(esc(stamp), " \u2022 Urgenti(\u226472h): <b>").concat(urgent.length, "</b> \u2022 LOW(pz): <b>").concat(low.length, "</b></div>\n\n  <h2>Urgenti scadenza (\u226472h)</h2>\n  <table>\n    <thead><tr><th>Prodotto</th><th>Qty</th><th>Sezione</th><th>Scadenza</th><th>Tag</th></tr></thead>\n    <tbody>").concat(urgent.length ? invRows(urgent) : "<tr><td colspan=\"5\" class=\"small\">Nessuna urgenza</td></tr>", "</tbody>\n  </table>\n\n  <h2>Congelatore</h2>\n  <table>\n    <thead><tr><th>Prodotto</th><th>Qty</th><th>Sezione</th><th>Scadenza</th><th>Tag</th></tr></thead>\n    <tbody>").concat(invRows(byLoc("freezer")), "</tbody>\n  </table>\n\n  <h2>Frigo</h2>\n  <table>\n    <thead><tr><th>Prodotto</th><th>Qty</th><th>Sezione</th><th>Scadenza</th><th>Tag</th></tr></thead>\n    <tbody>").concat(invRows(byLoc("fridge")), "</tbody>\n  </table>\n\n  ").concat(shopTable("economato"), "\n  ").concat(shopTable("giornaliero"), "\n  ").concat(shopTable("settimanale"), "\n\n</body></html>");
    downloadBlob(new Blob([html], { type: "application/msword;charset=utf-8" }), filename);
}
