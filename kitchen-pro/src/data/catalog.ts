export type CatalogCategory = {
  key: string;
  label: string;
  defaultParPz: number;
  examples: string[];
};

export const MICHELIN_CATEGORIES: CatalogCategory[] = [
  { key: "proteine",    label: "Proteine animali",       defaultParPz: 6,  examples: ["Piccione", "Astice", "Wagyu", "Animelle"] },
  { key: "pesce",       label: "Pesce & molluschi",      defaultParPz: 4,  examples: ["Rombo", "Capesante", "Ricci", "Polpo"] },
  { key: "verdure",     label: "Verdure & radici",       defaultParPz: 8,  examples: ["Topinambur", "Scorzonera", "Cavolo Nero"] },
  { key: "erbe",        label: "Erbe & fiori",           defaultParPz: 12, examples: ["Acetosella", "Borragine", "Fiori di Zucca"] },
  { key: "dairy",       label: "Latticini & uova",       defaultParPz: 6,  examples: ["Burro Bordier", "Panna cruda", "Uova"] },
  { key: "cereali",     label: "Farine & cereali",       defaultParPz: 3,  examples: ["Farro monococco", "Semola Senatore Cappelli"] },
  { key: "grassi",      label: "Grassi & oli",           defaultParPz: 4,  examples: ["EVO monocultivar", "Lardo Colonnata", "Burro chiarificato"] },
  { key: "acidi",       label: "Acidi & fermentati",     defaultParPz: 6,  examples: ["Aceto di Barolo", "Koji", "Miso", "Kombucha"] },
  { key: "spezie",      label: "Spezie & aromi secchi",  defaultParPz: 10, examples: ["Pepe lungo", "Sumac", "Cardamomo", "Fior di sale"] },
  { key: "fondi",       label: "Fondi & riduzioni",      defaultParPz: 4,  examples: ["Fondo bruno", "Dashi", "Bisque", "Glace"] },
  { key: "beverage",    label: "Cantina & beverage",     defaultParPz: 6,  examples: ["Vini", "Sake", "Distillati cucina"] },
  { key: "secco",       label: "Consumabili & secco",    defaultParPz: 5,  examples: ["Carta forno", "Agar-agar", "Lecitina"] },
];

// Derived helpers used by Invoice.tsx and other pages
export type CategoryKey = (typeof MICHELIN_CATEGORIES)[number]["key"];

export const CATEGORY_KEYS: string[] = MICHELIN_CATEGORIES.map((c) => c.key);

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  MICHELIN_CATEGORIES.map((c) => [c.key, c.label])
);

export type CatalogProduct = {
  id: string;
  name: string;
  categoryKey: string;
  defaultLocation: "freezer" | "fridge" | "dry" | "counter";
};

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  { id: "wagyu",        name: "Wagyu",        categoryKey: "proteine", defaultLocation: "freezer" },
  { id: "capesante",    name: "Capesante",    categoryKey: "pesce",    defaultLocation: "freezer" },
  { id: "burro-bordier",name: "Burro Bordier",categoryKey: "dairy",    defaultLocation: "fridge"  },
];

// Alias used by Invoice.tsx (CATALOG = CATALOG_PRODUCTS)
export const CATALOG = CATALOG_PRODUCTS;
