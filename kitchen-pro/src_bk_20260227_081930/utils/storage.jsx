"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJSON = readJSON;
exports.writeJSON = writeJSON;
/** Wrapper localStorage con try/catch — evitano duplicazione nel monolite */
function readJSON(key, fallback) {
    try {
        var raw = localStorage.getItem(key);
        if (!raw)
            return fallback;
        return JSON.parse(raw);
    }
    catch (_a) {
        return fallback;
    }
}
function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch (_a) { }
}
