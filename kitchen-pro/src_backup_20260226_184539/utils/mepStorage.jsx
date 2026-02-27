"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadMEP = loadMEP;
exports.saveMEP = saveMEP;
var NS = "kitchen-pro:mep:v1";
function key(kitchenId) {
    return "".concat(NS, ":").concat(kitchenId);
}
function loadMEP(kitchenId) {
    var today = new Date().toISOString().slice(0, 10);
    try {
        var raw = localStorage.getItem(key(kitchenId));
        if (!raw)
            return { date: today, tasks: [] };
        var parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object")
            return { date: today, tasks: [] };
        // reset giornaliero automatico
        if (parsed.date !== today)
            return { date: today, tasks: [] };
        var tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
        return { date: today, tasks: tasks };
    }
    catch (_a) {
        return { date: today, tasks: [] };
    }
}
function saveMEP(kitchenId, date, tasks) {
    localStorage.setItem(key(kitchenId), JSON.stringify({ date: date, tasks: tasks }));
}
