export type Unit =
  | "pz"
  | "g"
  | "kg"
  | "ml"
  | "l"
  // Packaging / contenitori (usati in fatture e carico)
  | "box"
  | "busta"
  | "brik"
  | "latta"
  | "vasch"
  | "vac";

export type Location = "freezer" | "fridge" | "dry" | "counter";

export type FreezerItem = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  location: Location;

  insertedAt: string; // ISO
  insertedDate?: string; // YYYY-MM-DD (UI)

  expiresAt?: string; // ISO
  category?: string;  // es: proteine/pesce/verdure...
  section?: string;
  notes?: string;

  lot?: string;       // lotto/partita
  parLevel?: number;  // SOLO per unit === "pz"
};
