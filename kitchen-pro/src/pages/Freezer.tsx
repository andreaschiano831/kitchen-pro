import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useKitchen } from "../store/kitchenStore";

type ViewLoc = "freezer" | "fridge";
type Unit = "pz" | "g" | "kg" | "ml" | "l";

function hoursUntil(iso?: string) {
  if (!iso) return null as number | null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null as number | null;
  return Math.floor((t - Date.now()) / (1000 * 60 * 60));
}

function expBadgeClass(h: number | null) {
  if (h === null) return "border-neutral-200 bg-white text-neutral-700";
  if (h <= 0) return "border-red-500 bg-red-100 text-red-900";
  if (h <= 24) return "border-red-300 bg-red-50 text-red-800";
  if (h <= 72) return "border-amber-300 bg-amber-50 text-amber-900";
  return "border-neutral-200 bg-white text-neutral-700";
}

function QuickAdjustButtons({
  unit,
  onDelta,
}: {
  unit: Unit;
  onDelta: (d: number) => void;
}) {
  if (unit === "pz") {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => onDelta(-1)}>-1</button>
        <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => onDelta(-5)}>-5</button>
        <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => onDelta(+1)}>+1</button>
        <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => onDelta(+5)}>+5</button>
      </div>
    );
  }

  if (unit === "g" || unit === "ml") {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => onDelta(-50)}>-50</button>
        <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => onDelta(-100)}>-100</button>
        <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => onDelta(-250)}>-250</button>
        <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => onDelta(+100)}>+100</button>
      </div>
    );
  }

  // kg/l: step piccoli
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => onDelta(-0.05)}>-0.05</button>
      <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => onDelta(-0.1)}>-0.10</button>
      <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => onDelta(-0.25)}>-0.25</button>
      <button className="btn btn-ghost px-3 py-1 text-xs" onClick={() => onDelta(+0.1)}>+0.10</button>
    </div>
  );
}

export default function Freezer() {
  const { state, addFreezerItem, removeFreezerItem, adjustFreezerItem, getCurrentRole } = useKitchen();
  const role = getCurrentRole();
  const canEdit =
    role === "admin" || role === "chef" || role === "sous-chef" || role === "capo-partita";

  const [viewLoc, setViewLoc] = useState<ViewLoc>("freezer");
  const [q, setQ] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [soloUrgenti, setSoloUrgenti] = useState(false);

  // form add
  const [name, setName] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>("pz");
  const [section, setSection] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [parLevel, setParLevel] = useState<number | undefined>(undefined);

  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const items = useMemo(() => {
    if (!kitchen) return [];
    const qq = q.trim().toLowerCase();
    const sf = sectionFilter.trim().toLowerCase();

    let list = (kitchen.freezer || [])
      .filter((it: any) => String(it.location || "freezer") === viewLoc)
      .filter((it: any) => (qq ? String(it.name || "").toLowerCase().includes(qq) : true))
      .filter((it: any) => (sf ? String(it.section || "").toLowerCase().includes(sf) : true))
      .slice();

    // FEFO: scadenza prima, poi insertedAt desc
    list.sort((a: any, b: any) => {
      const ad = a.expiresAt ? Date.parse(a.expiresAt) : Infinity;
      const bd = b.expiresAt ? Date.parse(b.expiresAt) : Infinity;
      if (ad !== bd) return ad - bd;
      const ai = a.insertedAt ? Date.parse(a.insertedAt) : 0;
      const bi = b.insertedAt ? Date.parse(b.insertedAt) : 0;
      return bi - ai;
    });

    
    if (soloUrgenti) {
      list = list.filter((it: any) => {
        const h = hoursUntil(it.expiresAt);
        return h !== null && h <= 72;
      });
    }

    return list;

  }, [kitchen, viewLoc, q, sectionFilter]);

  function handleAdd() {
    if (!canEdit) return;
    const n = name.trim();
    if (!n) return;

    const qn = Number(qty);
    if (!Number.isFinite(qn) || qn <= 0) return;

    addFreezerItem({
      id: uuid(),
      name: n,
      quantity: unit === "pz" ? Math.floor(qn) : qn,
      unit,
      location: viewLoc,
      insertedAt: new Date().toISOString(),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      section: section.trim() || undefined,
      parLevel,
    } as any);

    setName("");
    setQty(1);
    setUnit("pz");
    setSection("");
    setExpiresAt("");
  }

  if (!kitchen) {
    return (
      <div className="card p-5">
        <div className="h1">Inventario</div>
        <p className="p-muted mt-2">Seleziona una kitchen prima (Kitchen).</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              className={`btn px-4 py-2 ${viewLoc === "freezer" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setViewLoc("freezer")}
            >
              Congelatore
            </button>
            <button
              className={`btn px-4 py-2 ${viewLoc === "fridge" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setViewLoc("fridge")}
            >
              Frigo
            </button>
          </div>

          <div className="text-xs" style={{ color: "var(--muted)" }}>
            <button
              className="btn btn-ghost px-3 py-1 text-xs"
              onClick={() => setSoloUrgenti(!soloUrgenti)}
            >
              {soloUrgenti ? "Mostra tutto" : "Solo urgenti"}
            </button>
            FEFO • {items.length} items • role: {role ?? "—"}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca (es. branzino, fondo, burro...)"
          />
          <input
            className="input"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            placeholder="Filtro sezione (es. pesce, carne, salse...)"
          />
        </div>
      </div>

      {/* Add */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="h1">Aggiungi</div>
          {!canEdit && <div className="p-muted text-xs">Solo ruoli senior possono modificare</div>}
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2">
          <input
            className="input md:col-span-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prodotto"
            disabled={!canEdit}
          />
          <input
            className="input"
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            min={1}
            step={unit === "pz" ? 1 : 0.01}
            disabled={!canEdit}
          />
          <select className="input" value={unit} onChange={(e) => setUnit(e.target.value as Unit)} disabled={!canEdit}>
            <option value="pz">pz</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
          </select>
          <input
            className="input"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="Sezione"
            disabled={!canEdit}
          />
          <input
            className="input"
            type="number"
            placeholder="Par"
            value={parLevel ?? ""}
            onChange={(e) => setParLevel(e.target.value ? Number(e.target.value) : undefined)}
            disabled={!canEdit}
          />
          <input
            className="input"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            disabled={!canEdit}
          />
        </div>

        <div className="mt-3">
          <button className={`btn ${canEdit ? "btn-primary" : "btn-ghost"}`} onClick={handleAdd} disabled={!canEdit}>
            Aggiungi a {viewLoc === "freezer" ? "Congelatore" : "Frigo"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="card p-4">
            <div className="p-muted">Nessun prodotto.</div>
          </div>
        )}

        {items.map((item: any) => {
          const du = hoursUntil(item.expiresAt);
          const u: Unit = (item.unit || "pz") as Unit;
          return (
            <div key={item.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{item.name}</div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs">
                      {item.quantity} {u}
                      {item.parLevel && item.quantity < item.parLevel && (
                        <span className="ml-2 text-xs text-red-600 font-semibold">LOW</span>
                      )}
                    </span>

                    {item.section && (
                      <span className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs">
                        {item.section}
                      </span>
                    )}

                    <span className={`rounded-md border px-2 py-1 text-xs ${expBadgeClass(du)}`}>
                      {du === null ? "no exp" : du <= 0 ? "SCADUTO" : `${du}d`}
                    </span>
                  </div>

                  {canEdit && (
                    <QuickAdjustButtons
                      unit={u}
                      onDelta={(d) => adjustFreezerItem(item.id, d)}
                    />
                  )}
                </div>

                {canEdit && (
                  <button className="btn btn-ghost px-3 py-2" onClick={() => removeFreezerItem(item.id)} title="Rimuovi">
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
