export type Unit =
  | "pz"
  | "g"
  | "kg"
  | "ml"
  | "l"
  | "vac"
  | "busta"
  | "brik"
  | "latta"
  | "box"
  | "vasch";

export type Location = "freezer" | "fridge" | "dry" | "counter";

export type FreezerItem = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  location: Location;
  insertedAt: string; // ISO
  expiresAt?: string; // ISO
  section?: string;
  notes?: string;
  category?: string;

  // MIN stock: usato SOLO per unit === "pz"
  parLevel?: number | null;
};
