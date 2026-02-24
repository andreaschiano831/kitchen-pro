import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useKitchen } from "../store/kitchenStore";
import type { Unit } from "../types/freezer";
import Modal from "../components/Modal";
import { Toast, type ToastMsg } from "../components/Toast";
import { expiryClass, expiryLabel, expiryLevel, isUrgent } from "../utils/expiry";

function minStock(item: any) {
  const unit = String(item.unit || "pz");
  if (unit !== "pz") return null as number | null;
  const v = item.parLevel;
  if (v === undefined || v === null) return 5; // default
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n <= 0) return 5;
  return n;
}

export default function Freezer() {
  const {
    state,
    addFreezerItem,
    removeFreezerItem,
    adjustFreezerItem,
    setFreezerParLevel,
    autoGenerateLowStockToEconomato,
    shopAdd,
    getCurrentRole,
  } = useKitchen();

  const role = getCurrentRole();
  const canEdit =
    role === "admin" || role === "chef" || role === "sous-chef" || role === "capo-partita";

  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const [name, setName] = useState("");
  const [unit, setUnit] = useState<Unit>("pz");
  const [qty, setQty] = useState<number>(1);
  const [location, setLocation] = useState<"freezer" | "fridge">("freezer");
  const [expiresAt, setExpiresAt] = useState<string>("");

  const [q, setQ] = useState("");
  const [soloUrgenti, setSoloUrgenti] = useState(false);

  const [lowOpen, setLowOpen] = useState(false);
  const [toast, setToast] = useState<ToastMsg | null>(null);

  const items = useMemo(() => {
    const list = (kitchen?.freezer || []).slice();

    // filter by location
    let filtered = list.filter((it: any) => (it.location || "freezer") === location);

    // search
    const qq = q.trim().toLowerCase();
    if (qq) filtered = filtered.filter((it: any) => String(it.name || "").toLowerCase().includes(qq));

    // urgent filter (expiry urgent OR low stock pz)
    if (soloUrgenti) {
      filtered = filtered.filter((it: any) => {
        const lev = expiryLevel(it.expiresAt);
        const urgentExp = isUrgent(lev);

        const u = String(it.unit || "pz");
        const min = u === "pz" ? (it.parLevel ?? 5) : null;
        const low = min !== null && Number(it.quantity ?? 0) < Number(min);

        return urgentExp || low;
      });
    }

    // sort: urgent expiry first, then name
    filtered.sort((a: any, b: any) => {
      const la = expiryLevel(a.expiresAt);
      const lb = expiryLevel(b.expiresAt);
      const wa = la === "expired" ? 3 : la === "h24" ? 2 : la === "h72" ? 1 : 0;
      const wb = lb === "expired" ? 3 : lb === "h24" ? 2 : lb === "h72" ? 1 : 0;
      if (wa != wb) return wb - wa;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });

    return filtered;
  }, [kitchen, location, q, soloUrgenti]);

  const lowItems = useMemo(() => {
    const list = (kitchen?.freezer || []).filter((it: any) => (it.unit || "pz") === "pz");
    return list
      .map((it: any) => {
        const min = it.parLevel ?? 5;
        const qty = Number(it.quantity ?? 0);
        return { id: it.id, name: it.name, qty, min, diff: Math.max(0, min - qty) };
      })
      .filter((x: any) => x.diff > 0)
      .sort((a: any, b: any) => b.diff - a.diff);
  }, [kitchen]);

  function addItem() {
    if (!canEdit) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    addFreezerItem({
      id: uuid(),
      name: trimmed,
      quantity: unit === "pz" ? Math.floor(qty || 1) : Number(qty || 1),
      unit,
      location,
      insertedAt: new Date().toISOString(),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    } as any);

    setName("");
    setQty(1);
    setUnit("pz");
    setExpiresAt("");
  }

  function runLowStock() {
    const n = autoGenerateLowStockToEconomato();
    setLowOpen(false);
    setToast({
      id: String(Date.now()),
      type: n > 0 ? "success" : "warning",
      title: n > 0 ? "Economato aggiornato" : "Nessun LOW stock",
      message: n > 0 ? `Generati/aggiornati ${n} articoli in Economato.` : "Tutte le giacenze pz sono sopra il minimo.",
    });
  }

  if (!kitchen) {
    return (
      <div className="card p-6">
        <div className="h1">Giacenze</div>
        <div className="p-muted mt-2">Seleziona una Kitchen.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-4">
        <div className="h1">Giacenze</div>
        <div className="p-muted text-xs mt-1">Freezer + Frigo • scadenze aggressive • par level (pz)</div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className={location === "freezer" ? "btn btn-primary text-xs" : "btn btn-ghost text-xs"} onClick={() => setLocation("freezer")}>
            Congelatore
          </button>
          <button className={location === "fridge" ? "btn btn-primary text-xs" : "btn btn-ghost text-xs"} onClick={() => setLocation("fridge")}>
            Frigo
          </button>

          <div className="flex-1" />

          <button className="btn btn-ghost text-xs" onClick={() => setSoloUrgenti((v) => !v)}>
            {soloUrgenti ? "Mostra tutto" : "Solo urgenti"}
          </button>

          <button className="btn btn-gold text-xs" onClick={() => setLowOpen(true)}>
            LOW stock → Economato
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="input md:col-span-2" placeholder="Cerca…" value={q} onChange={(e) => setQ(e.target.value)} />

          <input className="input md:col-span-2" placeholder="Nuovo item…" value={name} onChange={(e) => setName(e.target.value)} disabled={!canEdit} />

          <select className="input" value={unit} onChange={(e) => setUnit(e.target.value as Unit)} disabled={!canEdit}>
            <option value="pz">pz</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
          </select>

          <input className="input" type="number" min={1} step={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} disabled={!canEdit} />

          <input className="input md:col-span-2" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} disabled={!canEdit} />

          <button className="btn btn-primary md:col-span-2" onClick={addItem} disabled={!canEdit}>
            Aggiungi
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {items.length == 0 ? (
          <div className="card p-4">
            <div className="p-muted">Nessun prodotto.</div>
          </div>
        ) : null}

        {items.map((item: any) => {
          const u = String(item.unit || "pz");
          const min = minStock(item);
          const isLow = u === "pz" && min !== null && Number(item.quantity ?? 0) < Number(min);

          const lev = expiryLevel(item.expiresAt);
          const showExp = lev !== "none" && lev !== "ok";

          return (
            <div key={item.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold truncate">{item.name}</div>
                    {showExp ? <span className={expiryClass(lev)}>{expiryLabel(lev)}</span> : null}
                    {isLow ? <span className="badge badge-urgent">LOW</span> : null}
                  </div>
                  <div className="p-muted text-xs mt-1">
                    Qty: <b>{item.quantity}</b> {u}
                    {u === "pz" ? (
                      <>
                        {" "}
                        • MIN:{" "}
                        <b>{(item.parLevel ?? 5)}</b>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {canEdit ? (
                    <>
                      {/* Quick adjust */}
                      <button className="btn btn-ghost text-xs" onClick={() => adjustFreezerItem(item.id, u === "pz" ? -1 : u === "kg" ? -1 : u === "l" ? -1 : -100)}>
                        -
                      </button>
                      <button className="btn btn-ghost text-xs" onClick={() => adjustFreezerItem(item.id, u === "pz" ? +1 : u === "kg" ? +1 : u === "l" ? +1 : +100)}>
                        +
                      </button>

                      {/* Par level inline (pz only) */}
                      {u === "pz" ? (
                        <button
                          className="btn btn-ghost text-xs"
                          onClick={() => {
                            const v = window.prompt("Imposta MIN (pz)", String(item.parLevel ?? 5));
                            if (v is None): pass
                          }}
                        >
                          MIN
                        </button>
                      ) : null}

                      {/* Single add to Economato */}
                      {canEdit && u === "pz" && isLow ? (
                        <button
                          className="btn btn-gold text-xs"
                          onClick={() => {
                            const m = (item.parLevel ?? 5);
                            const diff = Math.max(1, Number(m) - Number(item.quantity ?? 0));
                            shopAdd(item.name, diff, "pz", "economato", "MANUALE: reintegro LOW stock");
                            setToast({
                              id: String(Date.now()),
                              type: "success",
                              title: "Economato",
                              message: `Aggiunto: ${item.name} +${diff} pz`,
                            });
                          }}
                        >
                          + Economato
                        </button>
                      ) : null}

                      <button className="btn btn-ghost text-xs" onClick={() => removeFreezerItem(item.id)}>
                        Rimuovi
                      </button>
                    </>
                  ) : (
                    <span className="p-muted text-xs">Solo lettura</span>
                  )}
                </div>
              </div>

              {/* Par editor: prompt safe (no python in TS) */}
              {canEdit && u === "pz" ? (
                <div className="mt-3 flex items-center gap-2">
                  <div className="p-muted text-xs">MIN (pz)</div>
                  <input
                    className="input w-24"
                    type="number"
                    min={1}
                    step={1}
                    value={item.parLevel ?? 5}
                    onChange={(e) => setFreezerParLevel(item.id, Math.max(1, Math.floor(Number(e.target.value) || 5)))}
                  />
                  <div className="p-muted text-xs">default 5</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* LOW stock modal */}
      <Modal open={lowOpen} title="LOW stock → Economato" onClose={() => setLowOpen(false)}>
        <div className="space-y-3">
          <div className="p-muted text-xs">
            Solo articoli in <b>pz</b> sotto MIN (default 5).
          </div>

          {lowItems.length === 0 ? (
            <div className="card p-3">
              <div className="text-sm font-semibold">Nessun LOW stock</div>
              <div className="text-xs text-neutral-600 mt-1">Non verrà aggiunto nulla in Economato.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {lowItems.slice(0, 10).map((x: any) => (
                <div key={x.id} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{x.name}</div>
                    <div className="text-xs text-neutral-500">qty {x.qty} / min {x.min}</div>
                  </div>
                  <div className="text-sm font-semibold">+{x.diff} pz</div>
                </div>
              ))}
              {lowItems.length > 10 ? (
                <div className="text-xs text-neutral-500">…e altri {lowItems.length - 10} articoli</div>
              ) : null}
            </div>
          )}

          <button className="btn btn-primary w-full" onClick={runLowStock}>
            Genera / Aggiorna Economato
          </button>
        </div>
      </Modal>

      {toast ? <Toast toast={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
