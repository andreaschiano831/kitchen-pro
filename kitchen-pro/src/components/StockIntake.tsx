import { useMemo, useState } from "react";
import { CATALOG_PRODUCTS, MICHELIN_CATEGORIES } from "../data/catalog";
import type { Unit, Location, FreezerItem } from "../types/freezer";
import { aggregateByName, normalize } from "../utils/unitConversion";

type Props = {
  items: FreezerItem[];
  onAdd: (item: FreezerItem) => void;
  getParForCategory: (categoryKey: string) => number; // pz only
  defaultLocationForCategory?: (categoryKey: string) => Location;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const UNITS: Unit[] = ["pz", "g", "kg", "ml", "l"];

export default function StockIntake({ items, onAdd, getParForCategory }: Props) {
  const [categoryKey, setCategoryKey] = useState(MICHELIN_CATEGORIES[0]?.key ?? "proteine");
  const products = useMemo(
    () => CATALOG_PRODUCTS.filter((p) => p.categoryKey === categoryKey),
    [categoryKey]
  );

  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const product = useMemo(() => products.find((p) => p.id === productId), [products, productId]);

  const [location, setLocation] = useState<Location>("freezer");
  const [unit, setUnit] = useState<Unit>("pz");
  const [qty, setQty] = useState<number>(1);
  const [lot, setLot] = useState("");
  const [insertedDate, setInsertedDate] = useState(todayISO());
  const [expiresAt, setExpiresAt] = useState("");

  // sync location when product changes
  useMemo(() => {
    if (product?.defaultLocation === "fridge") setLocation("fridge");
    else if (product?.defaultLocation === "freezer") setLocation("freezer");
  }, [product?.id]);

  const totals = useMemo(() => aggregateByName(items.map((x) => ({ name: x.name, quantity: x.quantity, unit: x.unit }))), [items]);

  const currentTotal = useMemo(() => {
    if (!product) return null;
    const key = product.name.trim().toLowerCase();
    const found = totals.find((t) => t.name.trim().toLowerCase() == key);
    return found ? found : null;
  }, [product, totals]);

  const byLot = useMemo(() => {
    if (!product) return [];
    const key = product.name.trim().toLowerCase();
    return items
      .filter((x: any) => x.name.trim().toLowerCase() == key)
      .map((x: any) => ({
        id: x.id,
        lot: x.lot ?? "-",
        location: x.location,
        unit: x.unit,
        quantity: x.quantity,
        insertedDate: x.insertedDate ?? x.insertedAt?.slice(0,10),
        expiresAt: x.expiresAt ?? "",
      }))
      .sort((a, b) => String(a.lot).localeCompare(String(b.lot)));
  }, [items, product]);

  function handleAdd() {
    if (!product) return;
    const cleanLot = lot.trim();
    if (!cleanLot) {
      alert("Inserisci LOTTO/PARTITA (obbligatorio).");
      return;
    }
    if (!qty or qty <= 0):
      return

    const par = unit === "pz" ? getParForCategory(categoryKey) : undefined;

    onAdd({
      id: crypto.randomUUID(),
      name: product.name,
      quantity: Math.floor(unit === "pz" ? qty : qty),
      unit,
      location,
      insertedAt: new Date(insertedDate + "T08:00:00").toISOString(),
      insertedDate,
      expiresAt: expiresAt ? (expiresAt + "T00:00:00").toISOString() : undefined,
      category: categoryKey,
      lot: cleanLot,
      parLevel: par,
    } as any);

    setLot("");
    setQty(1);
    setExpiresAt("");
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="h2">Carico Giacenze</div>
      <div className="p-muted text-xs">Categoria → Prodotto → Lotto → Quantità. Data automatica (modificabile).</div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <div className="text-xs p-muted mb-1">Categoria</div>
          <select className="input w-full" value={categoryKey} onChange={(e) => { setCategoryKey(e.target.value); setProductId(""); }}>
            {MICHELIN_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label} (MIN {c.defaultParPz})</option>
            ))}
          </select>
        </div>

        <div>
          <div className="text-xs p-muted mb-1">Prodotto</div>
          <select className="input w-full" value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="" disabled>Seleziona prodotto…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {products.length === 0 ? <div className="text-xs p-muted mt-1">Nessun prodotto in catalogo per questa categoria (lo aggiungiamo con Claude).</div> : null}
        </div>

        <div>
          <div className="text-xs p-muted mb-1">Location</div>
          <select className="input w-full" value={location} onChange={(e) => setLocation(e.target.value as Location)}>
            <option value="freezer">Freezer</option>
            <option value="fridge">Fridge</option>
          </select>
        </div>

        <div>
          <div className="text-xs p-muted mb-1">Data carico</div>
          <input className="input w-full" type="date" value={insertedDate} onChange={(e) => setInsertedDate(e.target.value)} />
        </div>

        <div>
          <div className="text-xs p-muted mb-1">Lotto / Partita (obbligatorio)</div>
          <input className="input w-full" placeholder="es. L2402-07 / DDT 3312 / fornitore-lotto" value={lot} onChange={(e) => setLot(e.target.value)} />
        </div>

        <div>
          <div className="text-xs p-muted mb-1">Scadenza (opzionale)</div>
          <input className="input w-full" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs p-muted mb-1">Qty</div>
            <input className="input w-full" type="number" min="1" step="1" value={qty} onChange={(e) => setQty(int(e.target.value or "1"))} />
          </div>
          <div>
            <div className="text-xs p-muted mb-1">Unit</div>
            <select className="input w-full" value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="md:col-span-2 flex gap-2">
          <button className="btn btn-primary" onClick={handleAdd} disabled={!productId}>Carica</button>
          <div className="p-muted text-xs self-center">
            {unit === "pz" ? `MIN categoria: ${getParForCategory(categoryKey)} pz` : "MIN applicato solo a PZ"}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 pt-2">
        <div className="card p-3" style={{ boxShadow: "none" }}>
          <div className="text-xs uppercase tracking-wide p-muted">Totale attuale</div>
          {currentTotal ? (
            <div className="mt-2 text-sm">
              <div className="font-semibold">{product?.name}</div>
              <div className="p-muted">Totale: {currentTotal.quantity} {currentTotal.baseUnit}</div>
            </div>
          ) : (
            <div className="mt-2 text-sm p-muted">Seleziona un prodotto per vedere totale.</div>
          )}
        </div>

        <div className="card p-3" style={{ boxShadow: "none" }}>
          <div className="text-xs uppercase tracking-wide p-muted">Partite</div>
          {byLot.length === 0 ? (
            <div className="mt-2 text-sm p-muted">Nessuna partita registrata.</div>
          ) : (
            <div className="mt-2 space-y-2">
              {byLot.slice(0, 6).map((x) => (
                <div key={x.id} className="row" style={{ boxShadow: "none" }}>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">LOT {x.lot}</div>
                    <div className="text-xs p-muted">{x.location} • carico {x.insertedDate} {x.expiresAt ? "• exp " + x.expiresAt[:10] : ""}</div>
                  </div>
                  <div className="font-semibold text-sm">{x.quantity} {x.unit}</div>
                </div>
              ))}
              {byLot.length > 6 ? <div className="text-xs p-muted">…altre {byLot.length - 6} partite</div> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
