"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todayDate = exports.nowISO = void 0;
/** Helpers di data condivisi — evitano duplicazione nel monolite */
var nowISO = function () { return new Date().toISOString(); };
exports.nowISO = nowISO;
var todayDate = function () { return new Date().toISOString().slice(0, 10); };
exports.todayDate = todayDate;
