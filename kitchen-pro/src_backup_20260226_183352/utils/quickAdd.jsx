"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseQuickAddText = parseQuickAddText;
var STOP_PREFIX = new Set(["del", "della", "dei", "degli", "delle", "le", "lo", "la", "i", "gli", "il", "un", "uno", "una"]);
var UNIT = {
    "kg": "kg", "kilo": "kg", "chilo": "kg", "chili": "kg", "kili": "kg",
    "g": "g", "gr": "g", "grammo": "g", "grammi": "g",
    "l": "l", "litro": "l", "litri": "l",
    "ml": "ml",
    "pz": "pz", "pezzo": "pz", "pezzi": "pz", "un": "pz", "unita": "pz", "unità": "pz",
    "vac": "vac", "sv": "vac", "sottovuoto": "vac",
    "busta": "busta", "buste": "busta", "confezione": "busta", "confezioni": "busta",
    "brik": "brik", "brick": "brik",
    "latta": "latta", "lattina": "latta", "lattine": "latta",
    "box": "box", "scatola": "box", "scatole": "box",
    "vasch": "vasch", "vaschetta": "vasch", "vaschette": "vasch",
};
var CAT_IT = {
    "proteine": "proteine",
    "pesce": "pesce",
    "verdure": "verdure",
    "erbe": "erbe",
    "latticini": "latticini",
    "cereali": "cereali",
    "grassi": "grassi",
    "fermentati": "fermentati",
    "spezie": "spezie",
    "fondi": "fondi",
    "cantina": "cantina",
    "consumabili": "consumabili",
    "default": "default",
};
function isNum(t) { return /^\d+(\.\d+)?$/.test(t); }
function titleCase(s) {
    var w = s.trim().split(/\s+/).filter(Boolean);
    var cleaned = w.filter(function (x, i) { return !(i === 0 && STOP_PREFIX.has(x.toLowerCase())); });
    return cleaned.map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase(); }).join(" ");
}
function iso(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return "".concat(y, "-").concat(m, "-").concat(dd);
}
function endOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function nextFriday(d) {
    var day = d.getDay(); // 0..6
    var delta = (5 - day + 7) % 7;
    var add = delta === 0 ? 7 : delta;
    var x = new Date(d);
    x.setDate(d.getDate() + add);
    return x;
}
function parseExpiry(tokens, i) {
    var t = (tokens[i] || "").toLowerCase();
    var now = new Date();
    if (t === "domani") {
        var x = new Date(now);
        x.setDate(now.getDate() + 1);
        return { exp: iso(x), next: i + 1 };
    }
    if (t === "tra" && isNum(tokens[i + 1] || "") && ((tokens[i + 2] || "").toLowerCase() === "giorni" || (tokens[i + 2] || "").toLowerCase() === "giorno")) {
        var n = Math.floor(Number(tokens[i + 1]));
        var x = new Date(now);
        x.setDate(now.getDate() + n);
        return { exp: iso(x), next: i + 3 };
    }
    if (t === "fine" && (tokens[i + 1] || "").toLowerCase() === "settimana") {
        var x = nextFriday(now);
        return { exp: iso(x), next: i + 2 };
    }
    if (t === "entro" && (tokens[i + 1] || "").toLowerCase() === "fine" && (tokens[i + 2] || "").toLowerCase() === "mese") {
        var x = endOfMonth(now);
        return { exp: iso(x), next: i + 3 };
    }
    if ((t === "exp" || t === "scad" || t === "scade" || t === "scadenza") && tokens[i + 1]) {
        var v = tokens[i + 1];
        if (/^\d{4}-\d{2}-\d{2}$/.test(v))
            return { exp: v, next: i + 2 };
        if (/^\d{1,2}$/.test(v)) {
            var day = Number(v);
            var x = new Date(now.getFullYear(), now.getMonth(), day);
            if (x.getTime() < now.getTime())
                x.setMonth(x.getMonth() + 1);
            return { exp: iso(x), next: i + 2 };
        }
    }
    return { next: i };
}
function inferLocation(name) {
    var n = name.toLowerCase();
    var freezer = ["surgel", "carne", "manzo", "vitello", "pollo", "agnello", "pesce", "gamber", "calam", "tonno", "salm", "astice"];
    var fridge = ["latte", "panna", "burro", "yogurt", "uova", "salume", "prosci", "formagg", "parmig", "verd", "insalat"];
    var dry = ["pasta", "riso", "farina", "olio", "spezie", "sale", "zucchero"];
    var counter = ["pane", "frutta"];
    if (freezer.some(function (h) { return n.includes(h); }))
        return "freezer";
    if (fridge.some(function (h) { return n.includes(h); }))
        return "fridge";
    if (dry.some(function (h) { return n.includes(h); }))
        return "dry";
    if (counter.some(function (h) { return n.includes(h); }))
        return "counter";
    return "fridge";
}
function inferCategory(name) {
    var n = name.toLowerCase();
    if (/(wagyu|piccione|animelle|carne|manzo|vitello|pollo|agnello|maiale)/.test(n))
        return "proteine";
    if (/(pesce|rombo|capesante|ricci|polpo|astice|gamber|calam|tonno|salm)/.test(n))
        return "pesce";
    if (/(topinambur|scorzonera|cavolo|verd)/.test(n))
        return "verdure";
    if (/(acetosella|borragine|fiori)/.test(n))
        return "erbe";
    if (/(burro|panna|uova|formagg|parmig)/.test(n))
        return "latticini";
    if (/(farina|cereali|farro|semola|riso|pasta)/.test(n))
        return "cereali";
    if (/(olio|lardo|grassi|chiarificato)/.test(n))
        return "grassi";
    if (/(koji|miso|kombucha|ferment)/.test(n))
        return "fermentati";
    if (/(pepe|sumac|cardamomo|sale|spezie)/.test(n))
        return "spezie";
    if (/(fondo|dashi|bisque|glace|riduz)/.test(n))
        return "fondi";
    if (/(vino|sake|distill|bevanda)/.test(n))
        return "cantina";
    if (/(carta|agar|lecitina|consum)/.test(n))
        return "consumabili";
    return "default";
}
function stripFiller(s) {
    return s.replace(/\b(allora|dunque|quindi|metti|tipo|per favore)\b/gi, "").replace(/\s+/g, " ").trim();
}
function parseOne(part) {
    var raw = stripFiller(part);
    if (!raw)
        return null;
    var tokens = raw.split(/\s+/).filter(Boolean);
    var i = 0;
    var qty = 1.0;
    var t0 = (tokens[i] || "").toLowerCase();
    if (t0 === "mezzo" || t0 === "mezza") {
        qty = 0.5;
        i++;
    }
    else if (isNum(tokens[i] || "")) {
        qty = Number(tokens[i]);
        i++;
    }
    var unit = "pz";
    var u = (tokens[i] || "").toLowerCase();
    if (u && UNIT[u]) {
        unit = UNIT[u];
        i++;
    }
    var location;
    var exp;
    var category;
    var notes;
    var nameParts = [];
    var notesParts = [];
    while (i < tokens.length) {
        var t = tokens[i].toLowerCase();
        if (t === "freezer" || t === "fridge" || t === "dry" || t === "counter") {
            location = t;
            i++;
            continue;
        }
        if (t === "frigo") {
            location = "fridge";
            i++;
            continue;
        }
        if (t === "congelatore") {
            location = "freezer";
            i++;
            continue;
        }
        var pe = parseExpiry(tokens, i);
        if (pe.next !== i) {
            exp = pe.exp;
            i = pe.next;
            continue;
        }
        if (t === "cat" || t === "categoria" || t === "category") {
            var v = tokens[i + 1];
            if (v) {
                var vv = v.toLowerCase();
                category = CAT_IT[vv] || vv;
                i += 2;
                continue;
            }
        }
        if (t === "note" || t === "notes") {
            notesParts.push.apply(notesParts, tokens.slice(i + 1));
            break;
        }
        nameParts.push(tokens[i]);
        i++;
    }
    var nameRaw = nameParts.join(" ").trim();
    if (!nameRaw)
        return null;
    var name = titleCase(nameRaw);
    if (!category)
        category = inferCategory(name);
    if (!location)
        location = inferLocation(name);
    if (!exp)
        exp = "?";
    if (notesParts.length)
        notes = titleCase(notesParts.join(" "));
    return {
        name: name,
        quantity: qty,
        unit: unit,
        location: location,
        expiresAt: exp,
        category: category,
        notes: notes,
        parLevel: unit === "pz" ? 5 : undefined,
    };
}
function parseQuickAddText(text) {
    var lines = text.split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
    var out = [];
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var parts = line.split(/,\s*/).map(function (x) { return x.trim(); }).filter(Boolean);
        for (var _a = 0, parts_1 = parts; _a < parts_1.length; _a++) {
            var part = parts_1[_a];
            var r = parseOne(part);
            if (!r) {
                out.push({ name: "⚠️ UNPARSED", quantity: 1, unit: "pz", expiresAt: "?", category: "default", notes: part });
            }
            else {
                out.push(r);
            }
        }
    }
    return out;
}
