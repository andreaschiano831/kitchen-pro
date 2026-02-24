export type Unit = "kg" | "g" | "pz" | "l";
export type Location = "freezer" | "fridge";

export type FreezerItem = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  insertedAt: string;

  location: Location;

  expiresAt?: string;   // YYYY-MM-DD
  section?: string;     // es: pesce, carni...
  notes?: string;
};
