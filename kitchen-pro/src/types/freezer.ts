export type Unit = "pz" | "g" | "kg" | "ml" | "l";
export type Location = "freezer" | "fridge";

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
