export type Unit = "pz" | "g" | "kg" | "ml" | "l";

export type Location = "freezer" | "fridge";

export type FreezerItem = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  insertedAt: string;
  location: Location;

  expiresAt?: string;
  section?: string;
  notes?: string;
};
