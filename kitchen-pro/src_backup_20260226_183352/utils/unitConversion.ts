import type { Unit } from "../types/freezer";

type Normalized = {
  quantity: number;
  baseUnit: "g" | "ml" | "pz";
};

export function normalize(qty: number, unit: Unit): Normalized {
  if (unit === "kg") return { quantity: qty * 1000, baseUnit: "g" };
  if (unit === "g") return { quantity: qty, baseUnit: "g" };

  if (unit === "l") return { quantity: qty * 1000, baseUnit: "ml" };
  if (unit === "ml") return { quantity: qty, baseUnit: "ml" };

  return { quantity: qty, baseUnit: "pz" };
}

export function formatSmart(qty: number, baseUnit: "g" | "ml" | "pz") {
  if (baseUnit === "g") {
    if (qty >= 1000) return `${(qty / 1000).toFixed(2)} kg`;
    return `${qty} g`;
  }

  if (baseUnit === "ml") {
    if (qty >= 1000) return `${(qty / 1000).toFixed(2)} l`;
    return `${qty} ml`;
  }

  return `${qty} pz`;
}

export function aggregateByName(
  items: { name: string; quantity: number; unit: Unit }[]
) {
  const map = new Map<
    string,
    { quantity: number; baseUnit: "g" | "ml" | "pz" }
  >();

  for (const item of items) {
    const key = item.name.trim().toLowerCase();
    const norm = normalize(item.quantity, item.unit);

    if (!map.has(key)) {
      map.set(key, { quantity: norm.quantity, baseUnit: norm.baseUnit });
    } else {
      const existing = map.get(key)!;

      if (existing.baseUnit === norm.baseUnit) {
        existing.quantity += norm.quantity;
      }
    }
  }

  return Array.from(map.entries()).map(([name, data]) => ({
    name,
    quantity: data.quantity,
    baseUnit: data.baseUnit,
  }));
}
