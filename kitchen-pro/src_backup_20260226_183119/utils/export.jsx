"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportEconomatoCSV = exportEconomatoCSV;
exports.buildKitchenReportHtml = buildKitchenReportHtml;
exports.buildUrgentReportHtml = buildUrgentReportHtml;
exports.downloadDoc = downloadDoc;
var expiry_1 = require("./expiry");
function dl(filename, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
function escCSV(v) {
    var s = String(v !== null && v !== void 0 ? v : "");
    if (s.includes('"') || s.includes(",") || s.includes("\n"))
        return '"' + s.replaceAll('"', '""') + '"';
    return s;
}
function exportEconomatoCSV(kitchen) {
    var rows = (kitchen.shopping || [])
        .filter(function (x) { return x.category === "economato"; })
        .map(function (x) {
        var _a;
        return ({
            name: x.name,
            quantity: x.quantity,
            unit: x.unit,
            checked: x.checked ? "YES" : "NO",
            notes: (_a = x.notes) !== null && _a !== void 0 ? _a : "",
        });
    });
    var header = ["name", "quantity", "unit", "checked", "notes"];
    var lines = __spreadArray([header.join(",")], rows.map(function (r) { return header.map(function (k) { return escCSV(r[k]); }).join(","); }), true);
    dl("economato-".concat(kitchen.name, ".csv"), lines.join("\n"), "text/csv;charset=utf-8");
}
function docShell(opts) {
    // Luxury theme: white base + bordeaux + gold
    return "\n<html><head><meta charset=\"utf-8\"/>\n<style>\n  body{font-family:Arial,sans-serif;color:#111;background:#fff;margin:24px}\n  .top{border-bottom:2px solid #C6A75E;padding-bottom:10px;margin-bottom:14px}\n  .brand{display:flex;align-items:baseline;justify-content:space-between;gap:12px}\n  .logo{font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#8B0000;font-size:14px}\n  .title{font-size:18px;font-weight:800;margin:2px 0 0}\n  .sub{color:#666;font-size:12px;margin-top:2px}\n  .pill{border:1px solid #C6A75E;background:#fff7e6;color:#6b4f12;font-size:11px;padding:2px 8px;border-radius:999px}\n  h2{font-size:13px;margin:18px 0 8px;color:#111}\n  table{width:100%;border-collapse:collapse}\n  th,td{border:1px solid #e5e5e5;padding:6px;font-size:12px}\n  th{background:#fafafa;text-align:left}\n  .muted{color:#666;font-size:12px}\n  .urgent{font-weight:700;color:#8B0000}\n</style>\n</head><body>\n  <div class=\"top\">\n    <div class=\"brand\">\n      <div>\n        <div class=\"logo\">Kitchen-Pro</div>\n        <div class=\"title\">".concat(opts.title, "</div>\n        <div class=\"sub\">").concat(opts.subtitle, "</div>\n      </div>\n      <div class=\"pill\">EXPORT \u2022 DOC</div>\n    </div>\n  </div>\n\n  ").concat(opts.body, "\n\n  <div class=\"muted\" style=\"margin-top:16px;border-top:1px solid #eee;padding-top:10px;\">\n    Generato da Kitchen-Pro \u2022 Layout premium\n  </div>\n</body></html>");
}
function mapGiacenze(kitchen) {
    return (kitchen.freezer || []).map(function (it) {
        var _a;
        return ({
            name: it.name,
            qty: it.quantity,
            unit: it.unit,
            location: it.location || "freezer",
            exp: it.expiresAt ? String(it.expiresAt).slice(0, 10) : "",
            min: it.unit === "pz" ? ((_a = it.parLevel) !== null && _a !== void 0 ? _a : 5) : "",
            expLevel: (0, expiry_1.expiryLevel)(it.expiresAt),
        });
    });
}
function buildKitchenReportHtml(kitchen) {
    var today = new Date().toISOString().slice(0, 10);
    var rows = mapGiacenze(kitchen);
    var economato = (kitchen.shopping || []).filter(function (x) { return x.category === "economato"; });
    var body = "\n  <h2>Giacenze (Freezer/Fridge)</h2>\n  <table>\n    <thead><tr><th>Prodotto</th><th>Qty</th><th>Unit</th><th>Loc</th><th>Scadenza</th><th>MIN (pz)</th></tr></thead>\n    <tbody>\n      ".concat(rows.map(function (r) { return "<tr>\n        <td>".concat(r.name, "</td><td>").concat(r.qty, "</td><td>").concat(r.unit, "</td><td>").concat(r.location, "</td><td>").concat(r.exp, "</td><td>").concat(r.min, "</td>\n      </tr>"); }).join(""), "\n    </tbody>\n  </table>\n\n  <h2>Economato (Lista spesa)</h2>\n  <table>\n    <thead><tr><th>Prodotto</th><th>Qty</th><th>Unit</th><th>Note</th><th>OK</th></tr></thead>\n    <tbody>\n      ").concat(economato.map(function (x) { var _a; return "<tr><td>".concat(x.name, "</td><td>").concat(x.quantity, "</td><td>").concat(x.unit, "</td><td>").concat((_a = x.notes) !== null && _a !== void 0 ? _a : "", "</td><td>").concat(x.checked ? "✓" : "", "</td></tr>"); }).join(""), "\n    </tbody>\n  </table>");
    return docShell({
        title: "".concat(kitchen.name, " \u2014 Report Completo"),
        subtitle: "Data: ".concat(today),
        body: body,
    });
}
function buildUrgentReportHtml(kitchen) {
    var today = new Date().toISOString().slice(0, 10);
    var rows = mapGiacenze(kitchen);
    var urgentExpiry = rows.filter(function (r) { return (0, expiry_1.isUrgent)(r.expLevel); });
    var lowStock = rows
        .filter(function (r) { return r.unit === "pz"; })
        .map(function (r) { return (__assign(__assign({}, r), { min: (r.min === "" ? 5 : Number(r.min)), diff: Math.max(0, (Number(r.min) || 5) - Number(r.qty || 0)) })); })
        .filter(function (r) { return r.diff > 0; });
    var body = "\n  <h2>Scadenze Urgenti (OGGI / 24h / 72h)</h2>\n  <table>\n    <thead><tr><th>Prodotto</th><th>Loc</th><th>Scadenza</th><th>Livello</th></tr></thead>\n    <tbody>\n      ".concat(urgentExpiry.length === 0
        ? "<tr><td colspan=\"4\" class=\"muted\">Nessuna scadenza urgente.</td></tr>"
        : urgentExpiry.map(function (r) { return "<tr>\n              <td class=\"urgent\">".concat(r.name, "</td>\n              <td>").concat(r.location, "</td>\n              <td>").concat(r.exp, "</td>\n              <td class=\"urgent\">").concat(r.expLevel, "</td>\n            </tr>"); }).join(""), "\n    </tbody>\n  </table>\n\n  <h2>LOW Stock (solo PZ sotto MIN)</h2>\n  <table>\n    <thead><tr><th>Prodotto</th><th>Qty</th><th>MIN</th><th>Da ordinare</th></tr></thead>\n    <tbody>\n      ").concat(lowStock.length === 0
        ? "<tr><td colspan=\"4\" class=\"muted\">Nessun low stock.</td></tr>"
        : lowStock.map(function (r) { return "<tr>\n              <td class=\"urgent\">".concat(r.name, "</td>\n              <td>").concat(r.qty, " pz</td>\n              <td>").concat(r.min, "</td>\n              <td class=\"urgent\">+").concat(r.diff, " pz</td>\n            </tr>"); }).join(""), "\n    </tbody>\n  </table>");
    return docShell({
        title: "".concat(kitchen.name, " \u2014 Report Urgenti"),
        subtitle: "Data: ".concat(today, " \u2022 scadenze + low stock"),
        body: body,
    });
}
function downloadDoc(filename, html) {
    dl(filename, html, "application/msword");
}
