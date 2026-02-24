export type Unit = "kg" | "g" | "pz" | "l";

export type FreezerItem = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  insertedAt: string;

  expiresAt?: string;   // ISO date
  section?: string;     // es: "carni", "pesce", "salse"
  notes?: string;
};
