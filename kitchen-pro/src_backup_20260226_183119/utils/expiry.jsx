"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hoursUntil = hoursUntil;
exports.expiryLevel = expiryLevel;
exports.expiryLabel = expiryLabel;
exports.expiryClass = expiryClass;
exports.isUrgent = isUrgent;
function hoursUntil(iso) {
    if (!iso)
        return null;
    var t = Date.parse(iso);
    if (Number.isNaN(t))
        return null;
    return Math.floor((t - Date.now()) / (1000 * 60 * 60));
}
function expiryLevel(iso) {
    var h = hoursUntil(iso);
    if (h === null)
        return "none";
    if (h <= 0)
        return "expired";
    if (h <= 24)
        return "h24";
    if (h <= 72)
        return "h72";
    return "ok";
}
function expiryLabel(level) {
    if (level === "expired")
        return "SCADUTO/OGGI";
    if (level === "h24")
        return "<24h";
    if (level === "h72")
        return "<72h";
    return "";
}
function expiryClass(level) {
    if (level === "expired" || level === "h24")
        return "badge badge-expired";
    if (level === "h72")
        return "badge badge-urgent";
    return "badge";
}
function isUrgent(level) {
    return level === "expired" || level === "h24" || level === "h72";
}
