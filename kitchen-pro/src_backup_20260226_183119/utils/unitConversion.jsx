"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = normalize;
exports.formatSmart = formatSmart;
exports.aggregateByName = aggregateByName;
function normalize(qty, unit) {
    if (unit === "kg")
        return { quantity: qty * 1000, baseUnit: "g" };
    if (unit === "g")
        return { quantity: qty, baseUnit: "g" };
    if (unit === "l")
        return { quantity: qty * 1000, baseUnit: "ml" };
    if (unit === "ml")
        return { quantity: qty, baseUnit: "ml" };
    return { quantity: qty, baseUnit: "pz" };
}
function formatSmart(qty, baseUnit) {
    if (baseUnit === "g") {
        if (qty >= 1000)
            return "".concat((qty / 1000).toFixed(2), " kg");
        return "".concat(qty, " g");
    }
    if (baseUnit === "ml") {
        if (qty >= 1000)
            return "".concat((qty / 1000).toFixed(2), " l");
        return "".concat(qty, " ml");
    }
    return "".concat(qty, " pz");
}
function aggregateByName(items) {
    var map = new Map();
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        var key = item.name.trim().toLowerCase();
        var norm = normalize(item.quantity, item.unit);
        if (!map.has(key)) {
            map.set(key, { quantity: norm.quantity, baseUnit: norm.baseUnit });
        }
        else {
            var existing = map.get(key);
            if (existing.baseUnit === norm.baseUnit) {
                existing.quantity += norm.quantity;
            }
        }
    }
    return Array.from(map.entries()).map(function (_a) {
        var name = _a[0], data = _a[1];
        return ({
            name: name,
            quantity: data.quantity,
            baseUnit: data.baseUnit,
        });
    });
}
