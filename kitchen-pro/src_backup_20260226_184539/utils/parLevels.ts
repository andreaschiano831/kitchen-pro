import type { Unit } from "../types/freezer";
import { normalize } from "./unitConversion";

export type ParLevel = {
  name: string;           // key (lowercase)
  minQty: number;
  minUnit: Unit;
};

const KEY = "kitchen-pro:par-levels:v1";

export function loadParLevels(): ParLevel[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveParLevels(levels: ParLevel[]) {
  localStorage.setItem(KEY, JSON.stringify(levels));
}

export function setParLevel(levels: ParLevel[], name: string, minQty: number, minUnit: Unit) {
  const key = name.trim().toLowerCase();
  const next = levels.filter(l => l.name !== key);
  next.push({ name: key, minQty, minUnit });
  next.sort((a,b) => a.name.localeCompare(b.name));
  return next;
}

export function removeParLevel(levels: ParLevel[], name: string) {
  const key = name.trim().toLowerCase();
  return levels.filter(l => l.name !== key);
}

export function compareToPar(currentQty: number, currentBase: "g"|"ml"|"pz", par: ParLevel) {
  const parNorm = normalize(par.minQty, par.minUnit);
  if (parNorm.baseUnit !== currentBase) return { status: "na" as const, ratio: null as number | null };

  const ratio = parNorm.quantity === 0 ? 999 : currentQty / parNorm.quantity;

  // ratio < 1 => sotto soglia
  if (ratio < 1) return { status: "low" as const, ratio };
  if (ratio < 1.1) return { status: "near" as const, ratio }; // entro 10%
  return { status: "ok" as const, ratio };
}
