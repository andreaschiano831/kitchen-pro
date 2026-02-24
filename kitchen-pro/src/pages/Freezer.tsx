import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useKitchen } from "../store/kitchenStore";
import type { Unit } from "../types/freezer";

type LocFilter = "all" | "freezer" | "fridge";

function hoursUntil(iso?: string) {
  if (!iso) return null as number | null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null as number | null;
  return Math.floor((t - Date.now()) / (1000 * 60 * 60));
}

function expBadge(h: number | null) {
  if (h === null) return null;
  if (h <= 0) return { cls: "badge badge-expired", label: "SCADUTO/OGGI" };
  if (h <= 24) return { cls: "badge badge-expired", label: "<24h" };
  if (h <= 72) return { cls: "badge badge-urgent", label: "<72h" };
  return null;
}

function minStock(item: any) {
  const unit = String(item.unit || "pz");
  if (unit !== "pz") return null as number | null;
  const v = item.parLevel;
  if (v === undefined || v === null) return 5;
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n <= 0) return 5;
  return n;
}

function unitStep(u: Unit) {
  if (u === "pz") return 1;
  if (u === "kg") return 100; // delta in g base? (qui lavoriamo in unità “native”: kg/l)
  if (u === "g") return 100;
  if (u === "l") return 0.5;
  if (u === "ml") return 100;
  return 1;
}

function quickDeltas(u: Unit) {
  // delta in unità nativa del record
  if (u === "pz") return [-5, -1, +1, +5];
  if (u === "g") return [-500, -100, +100, +500];
  if (u === "kg") return [-1, -0.5, +0.5, +1];
  if (u === "ml") return [-500, -100, +100, +500];
  if (u === "l") return [-1, -0.5, +0.5, +1];
  return [-1, +1];
}

export default function Freezer() {
  const {
    state,
    addFreezerItem,
    removeFreezerItem,
    adjustFreezerItem,
    setFreezerParLevel,
    getCurrentRole,
  } = useKitchen();

  const role = getCurrentRole();
  const canEdit = role === "admin" || role === "chef" || role === "sous-chef" || role === "capo-partita";

  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  // UI state
  const [loc, setLoc] = useState<LocFilter>("all");
  const [q, setQ] = useState("");
  const [soloUrgenti, setSoloUrgenti] = useState(false);

  // Add form
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>("pz");
  const [location, setLocation] = useState<"freezer" | "fridge">("freezer");
  const [section, setSection] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [parLevel, setParLevel] = useState<number>(5);

  const items = useMemo(() => {
    if (!kitchen) return [];
    let list = (kitchen.freezer || []).slice();

    // filtro location
    if (loc !== "all") {
      list = list.filter((it: any) => String(it.location || "freezer") === loc);
    }

    // ricerca
    const qq = q.trim().toLowerCase();
    if (qq) {
      list = list.filter((it: any) => String(it.name || "").toLowerCase().includes(qq));
    }

    // urgenti
    if (soloUrgenti) {
      list = list.filter((it: any) => {
        const h = hoursUntil(it.expiresAt);
        return h !== null && h <= 72;
      });
    }

    // FEFO (expiresAt asc, poi insertedAt desc)
    list.sort((a: any, b: any) => {
      const ad = a.expiresAt ? Date.parse(a.expiresAt) : Infinity;
      const bd = b.expiresAt ? Date.parse(b.expiresAt) : Infinity;
      if (ad !== bd) return ad - bd;
      const ai = a.insertedAt ? Date.parse(a.insertedAt) : 0;
      const bi = b.insertedAt ? Date.parse(b.insertedAt) : 0;
      return bi - ai;
    });

    return list;
  }, [kitchen, loc, q, soloUrgenti]);

  function handleAdd() {
    if (!kitchen || !canEdit) return;
    const n = name.trim();
    if (!n) return;

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return;

    const item = {
      id: uuid(),
      name: n,
      quantity: unit === "pz" ? Math.floor(qty) : qty,
      unit,
      location,
      insertedAt: new Date().toISOString(),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      section: section.trim() || undefined,
      parLevel: unit === "pz" ? (Number.isFinite(Number(parLevel)) && Number(parLevel) > 0 ? Math.floor(parLevel) : 5) : undefined,
    };

    addFreezerItem(item as any);

    setName("");
    setQuantity(1);
    setUnit("pz");
    setLocation("freezer");
    setSection("");
    setExpiresAt("");
    setParLevel(5);
  }

  if (!kitchen) {
    return (
      <div className="card p-6">
        <div className="h1">Giacenze</div>
        <div className="p-muted mt-2">Seleziona una Kitchen prima.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="h1">Giacenze</div>
            <div className="p-muted text-xs mt-1">FEFO • Filtro location • Urgenze • LOW stock (pz)</div>
          </div>

          <button
            className="btn btn-ghost px-3 py-2 text-xs"
            onClick={() => setSoloUrgenti((v) => !v)}
          >
            {soloUrgenti ? "Mostra tutto" : "Solo urgenti"}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2">
          <input
            className="input md:col-span-2"
            placeholder="Cerca prodotto…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select className="input" value={loc} onChange={(e) => setLoc(e.target.value as LocFilter)}>
            <option value="all">Tutti</option>
            <option value="freezer">Congelatore</option>
            <option value="fridge">Frigo</option>
          </select>

          <div className="md:col-span-3 p-muted text-xs flex items-center">
            Totale: <b className="ml-1 text-neutral-900">{items.length}</b>
          </div>
        </div>
      </div>

      {/* Add */}
      <div className="card p-4">
        <div className="h2">Nuovo inserimento</div>
        {!canEdit && <div className="p-muted text-xs mt-1">Solo ruoli senior possono modificare.</div>}

        <div className="mt-3 grid grid-cols-1 md:grid-cols-8 gap-2">
          <input className="input md:col-span-2" placeholder="Prodotto" value={name} onChange={(e) => setName(e.target.value)} disabled={!canEdit} />
          <input className="input" type="number" min={1} step={unit === "pz" ? 1 : 0.1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} disabled={!canEdit} />
          <select className="input" value={unit} onChange={(e) => setUnit(e.target.value as Unit)} disabled={!canEdit}>
            <option value="pz">pz</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
          </select>
          <select className="input" value={location} onChange={(e) => setLocation(e.target.value as any)} disabled={!canEdit}>
            <option value="freezer">Congelatore</option>
            <option value="fridge">Frigo</option>
          </select>
          <input className="input" placeholder="Sezione" value={section} onChange={(e) => setSection(e.target.value)} disabled={!canEdit} />
          <input className="input" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} disabled={!canEdit} />
          <input className="input" type="number" min={1} step={1} value={parLevel} onChange={(e) => setParLevel(Number(e.target.value))} disabled={!canEdit || unit !== "pz"} placeholder="MIN" />
        </div>

        <div className="mt-3">
          <button className="btn btn-primary" onClick={handleAdd} disabled={!canEdit}>Aggiungi</button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {items.length == 0 && (
          <div className="card p-4">
            <div className="p-muted">Nessun prodotto.</div>
          </div>
        )}

        {items.map((item: any) => {
          const u: Unit = (item.unit || "pz") as Unit;
          const h = hoursUntil(item.expiresAt);
          const exp = expBadge(h);
          const ms = minStock(item);
          const isLow = ms !== null && Number(item.quantity) < Number(ms);

          return (
            <div key={item.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-semibold truncate">{item.name}</div>
                    <span className="badge">{item.location === "fridge" ? "FRIGO" : "CONGELATORE"}</span>
                    {item.section && <span className="badge">{item.section}</span>}
                    {isLow && <span className="badge badge-low">LOW (MIN {ms})</span>}
                    {exp && <span className={exp.cls}>{exp.label}</span>}
                  </div>

                  <div className="p-muted text-xs mt-1">
                    Qty: <b className="text-neutral-900">{item.quantity} {u}</b>
                    {item.expiresAt && <> • Scadenza: <b className="text-neutral-900">{String(item.expiresAt).slice(0,10)}</b></>}
                  </div>

                  {/* MIN editor only for pz */}
                  {canEdit && u === "pz" && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="p-muted text-xs">MIN</span>
                      <input
                        className="input w-24"
                        type="number"
                        min={1}
                        step={1}
                        value={ms ?? 5}
                        onChange={(e) => setFreezerParLevel(item.id, Number(e.target.value))}
                      />
                      <span className="p-muted text-xs">(solo pezzi)</span>
                    </div>
                  )}

                  {/* Quick adjust */}
                  {canEdit && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {quickDeltas(u).map((d) => (
                        <button
                          key={d}
                          className="btn btn-ghost px-3 py-2 text-xs"
                          onClick={() => adjustFreezerItem(item.id, d)}
                        >
                          {d > 0 ? `+${d}` : String(d)} {u}
                        </button>
                      ))}
                      <button className="btn btn-ghost px-3 py-2 text-xs" onClick={() => removeFreezerItem(item.id)}>
                        Rimuovi
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="kpi" style={{ fontSize: 22 }}>{item.quantity}</div>
                  <div className="p-muted text-xs">{u}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
