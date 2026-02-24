export type FreezerItem = {
  id: string;
  name: string;
  quantity: number;
  unit: "kg" | "g" | "pz" | "l";
  insertedAt: string;
  expiresAt?: string;
  section?: string;
};
