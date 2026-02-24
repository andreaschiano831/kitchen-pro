import type { Unit } from "../types/freezer";

export type QuickAddDraft = {
  name: string;
  quantity: number;
  unit: Unit;
  location?: "freezer" | "fridge";
  section?: string;
  expiresAt?: string; // ISO
  notes?: string;
};

// UNIT_MAP removed for pz-only mode
const UNIT_MAP: Record<string, Unit> = {
  kg: "kg",
  g: "g",
  gr: "g",
  pz: "pz",
  pezzi: "pz",
  l: "l",
  lt: "l",
};

function normalize(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

function parseDateToken(token: string): string | undefined {
  // accepts: 2026-03-10, 10/03/2026, 10-03-2026
  const iso = token.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dmy = token.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  return undefined;
}

export function quickAddParse(input: string): QuickAddDraft {
  const raw = normalize(input);
  if (!raw) return { name: "", quantity: 1, unit: "pz" };

  // pattern: "salmone 2 kg #pesce exp 2026-03-10 note affumicato"
  const tokens = raw.split(" ");

  let quantity = 1;
  let unit: Unit = "pz"; // fixed
  let section: string | undefined;
  let expiresAt: string | undefined;
  let notes: string | undefined;

  // extract section via #tag
  const hash = tokens.find((t) => t.startsWith("#"));
  if (hash && hash.length > 1) section = hash.slice(1).toLowerCase();

  // extract exp / scad
  for (let i = 0; i < tokens.length - 1; i++) {
    const t = tokens[i].toLowerCase();
    if (t === "exp" || t === "scad" || t === "scadenza") {
      const d = parseDateToken(tokens[i + 1]);
      if (d) expiresAt = d;
    }
  }

  // quantity + optional unit
  for (let i = 0; i < tokens.length; i++) {
    const maybeNum = Number(tokens[i].replace(",", "."));
    if (!Number.isNaN(maybeNum) && maybeNum > 0) {
      quantity = maybeNum;
      const maybeUnit = tokens[i + 1]?.toLowerCase();
      if (maybeUnit && UNIT_MAP[maybeUnit]) {
        unit = UNIT_MAP[maybeUnit];
      }
      break;
    }
  }

  // notes (after "note:")
  const noteIdx = tokens.findIndex((t) => t.toLowerCase().startsWith("note"));
  if (noteIdx !== -1) {
    notes = tokens.slice(noteIdx + 1).join(" ");
  }

  // name = remove known tokens (#tag, exp/scad + date, quantity+unit, note...)
  const cleaned = tokens.filter((t) => {
    const low = t.toLowerCase();
    if (t.startsWith("#")) return false;
    if (low in UNIT_MAP) return false;
    if (low === "exp" || low === "scad" || low === "scadenza") return false;
    if (parseDateToken(t)) return false;
    if (low.startsWith("note")) return false;

    // remove numeric if it's quantity (approx)
    const n = Number(t.replace(",", "."));
    if (!Number.isNaN(n) && n === quantity) return false;

    return true;
  });

  const name = cleaned.join(" ").trim();
  return { name, quantity, unit, section, expiresAt, notes };
}
