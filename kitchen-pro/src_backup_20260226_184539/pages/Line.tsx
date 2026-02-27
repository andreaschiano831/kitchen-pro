import { useMemo, useState } from "react";
import type { Location, Unit } from "../types/freezer";
import { useKitchen } from "../store/kitchenStore";

type LineRow = {
  id: string;
  name: string;
  qty: number;
  unit: Unit;
  from: Location;
  to: Location;
  note?: string;
  lot?: string;
  category?: string;
  sourceId?: string; // scegli la partita da scalare
};

const UNITS: Unit[] = ["pz","g","kg","ml","l"];

export default function Line() {
  const { state, getCurrentRole, moveStock } = useKitchen();
  const role = getCurrentRole();
  const canEdit = role === "admin" || role === "chef" || role === "sous-chef" || role === "capo-partita";

  const kitchen = useMemo(() => state.kitchens.find((k) => k.id === state.currentKitchenId), [state]);
  const items = kitchen?.freezer ?? [];

  const [rows, setRows] = useState<LineRow[]>([]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState<Unit>("pz");
  const [from, setFrom] = useState<Location>("freezer");
  const [to, setTo] = useState<Location>("fridge");
  const [note, setNote] = useState("");

  function addRow() {
    const t = name.trim();
    if (!t) return;
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: t, qty: Math.max(1, Math.floor(qty)), unit, from, to, note: note.trim() || undefined },
    ]);
    setName("");
    setQty(1);
    setNote("");
  }

  function applyAll() {
    if (!kitchen || !canEdit) return;
    for (const r of rows) {
      // scegli la “miglior” partita da scalare: stessa name+from, preferisci quella con scadenza più vicina
      const candidates = items
        .filter((x) => x.name.toLowerCase() === r.name.toLowerCase() && x.location === r.from)
        .sort((a, b) => String(a.expiresAt || "9999").localeCompare(String(b.expiresAt || "9999")));

      const source = candidates[0];

      moveStock({
        name: r.name,
        qty: r.qty,
        unit: r.unit,
        from: r.from,
        to: r.to,
        sourceId: source?.id,
        lot: source?.lot,
        category: source?.category,
        note: r.note,
      });
    }
    setRows([]);
    alert("Trasferimento applicato: prelievi scalati + carico in frigo MEP.");
  }

  if (!kitchen) return <div className="card p-4">Seleziona una kitchen.</div>;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="h2">Linea / Prelievi</div>
        <div className="p-muted text-xs mt-1">
          Crea una lista di prelievo (freezer/dry) → frigo MEP. Applica = scala + carica.
        </div>

        <div className="grid md:grid-cols-6 gap-2 mt-3">
          <input className="input md:col-span-2" placeholder="Prodotto (es. Wagyu)" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" type="number" min="1" step="1" value={qty} onChange={(e) => setQty(parseInt(e.target.value || "1",10))} />
          <select className="input" value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <select className="input" value={from} onChange={(e) => setFrom(e.target.value as Location)}>
            <option value="freezer">freezer</option>
            <option value="dry">dry</option>
            <option value="fridge">fridge</option>
          </select>
          <select className="input" value={to} onChange={(e) => setTo(e.target.value as Location)}>
            <option value="fridge">fridge (MEP)</option>
            <option value="counter">counter</option>
          </select>

          <input className="input md:col-span-6" placeholder="Nota (stazione / servizio / chef) — opzionale" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="mt-3 flex gap-2">
          <button className="btn btn-primary" onClick={addRow} disabled={!canEdit}>Aggiungi</button>
          <button className="btn btn-gold" onClick={applyAll} disabled={!canEdit || rows.length === 0}>Applica trasferimento</button>
        </div>
      </div>

      <div className="card p-4">
        <div className="h2">Lista prelievi</div>
        {rows.length === 0 ? (
          <div className="p-muted text-sm mt-2">Nessun prelievo. Aggiungi righe sopra.</div>
        ) : (
          <div className="mt-2 space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="row">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{r.name}</div>
                  <div className="text-xs p-muted">{r.from} → {r.to}{r.note ? " • " + r.note : ""}</div>
                </div>
                <div className="font-semibold">{r.qty} {r.unit}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
