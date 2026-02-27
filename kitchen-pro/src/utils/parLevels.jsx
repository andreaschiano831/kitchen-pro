"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadParLevels = loadParLevels;
exports.saveParLevels = saveParLevels;
exports.setParLevel = setParLevel;
exports.removeParLevel = removeParLevel;
exports.compareToPar = compareToPar;
var unitConversion_1 = require("./unitConversion");
var KEY = "kitchen-pro:par-levels:v1";
function loadParLevels() {
    try {
        var raw = localStorage.getItem(KEY);
        if (!raw)
            return [];
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return [];
        return parsed;
    }
    catch (_a) {
        return [];
    }
}
function saveParLevels(levels) {
    localStorage.setItem(KEY, JSON.stringify(levels));
}
function setParLevel(levels, name, minQty, minUnit) {
    var key = name.trim().toLowerCase();
    var next = levels.filter(function (l) { return l.name !== key; });
    next.push({ name: key, minQty: minQty, minUnit: minUnit });
    next.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return next;
}
function removeParLevel(levels, name) {
    var key = name.trim().toLowerCase();
    return levels.filter(function (l) { return l.name !== key; });
}
function compareToPar(currentQty, currentBase, par) {
    var parNorm = (0, unitConversion_1.normalize)(par.minQty, par.minUnit);
    if (parNorm.baseUnit !== currentBase)
        return { status: "na", ratio: null };
    var ratio = parNorm.quantity === 0 ? 999 : currentQty / parNorm.quantity;
    // ratio < 1 => sotto soglia
    if (ratio < 1)
        return { status: "low", ratio: ratio };
    if (ratio < 1.1)
        return { status: "near", ratio: ratio }; // entro 10%
    return { status: "ok", ratio: ratio };
}
