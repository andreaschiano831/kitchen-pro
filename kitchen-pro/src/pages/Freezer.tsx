import { useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useSearchParams } from "react-router-dom";
import { useKitchen } from "../store/kitchenStore";
import { aggregateByName, formatSmart } from "../utils/unitConversion";
import { quickAddParse } from "../utils/quickAdd";
import { useSpeech } from "../hooks/useSpeech";
import type { Location, Unit } from "../types/freezer";

function daysLeft(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  const now = new Date();
  const diff = d.getTime() - new Date(now.toDateString()).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function expBadgeClass(d: number | null) {
  if (d === null) return "badge";
  if (d <= 0) return "badge border border-[#8B0000] bg-[#fff1f1] text-[#8B0000]";
  if (d <= 1) return "badge border border-[#C6A75E] bg-[#fff7e6] text-[#6b4f12]";
  if (d <= 3) return "badge border border-[#C6A75E] bg-[#fff7e6] text-[#6b4f12]";
  return "badge";
}

export default function Freezer() {
  const { state, addFreezerItem, removeFreezerItem, getCurrentRole } = useKitchen();
  const role = getCurrentRole();
  const [params] = useSearchParams();

  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const canEdit = role === "admin" || role === "chef" || role === "sous-chef" || role === "capo-partita";

  const [location, setLocation] = useState<Location>("freezer"); // default
  const [raw, setRaw] = useState("");
  const { transcript, status, start } = useSpeech();

  useEffect(() => {
    if (transcript) setRaw(transcript);
  }, [transcript]);

  useEffect(() => {
    const q = params.get("q");
    if (q) setRaw(decodeURIComponent(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draft = useMemo(() => quickAddParse(raw), [raw]);

  // se nel testo c'è loc, allinea la tab
  useEffect(() => {
    if (draft.location) setLocation(draft.location);
  }, [draft.location]);

  const [overrideQty, setOverrideQty] = useState<number | "">("");
  const [overrideUnit, setOverrideUnit] = useState<Unit | "">("");
  const [overrideSection, setOverrideSection] = useState("");
  const [overrideExp, setOverrideExp] = useState("");

  const aggregated = aggregateByName(kitchen?.freezer || []);

  if (!kitchen) {
    return (
      <div className="card p-5">
        <div className="h1">Inventory</div>
        <p className="p-muted mt-2">Seleziona una kitchen prima.</p>
      </div>
    );
  }

  const items = kitchen.freezer
    .filter((x) => x.location === location)
    .slice()
    .sort((a, b) => (a.expiresAt || "9999-99-99").localeCompare(b.expiresAt || "9999-99-99"));

  function handleAdd() {
    if (!canEdit) return;
    const name = (draft.name || "").trim();
    if (!name) return;

    const quantity = overrideQty === "" ? draft.quantity : Number(overrideQty);
    const unit = (overrideUnit === "" ? draft.unit : overrideUnit) as Unit;

    addFreezerItem({
      id: uuid(),
      name,
      quantity: quantity > 0 ? quantity : 1,
      unit,
      location,
      section: (overrideSection || draft.section || "").trim() || undefined,
      expiresAt: (overrideExp || draft.expiresAt || "").trim() || undefined,
      insertedAt: new Date().toISOString(),
      notes: draft.notes?.trim() || undefined,
    });

    setRaw("");
    setOverrideQty("");
    setOverrideUnit("");
    setOverrideSection("");
    setOverrideExp("");
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h1">Inventory</div>
            <div className="p-muted">{kitchen.name}</div>
          </div>
          <div className="badge" style={{ borderColor: "rgba(198,167,94,.6)" }}>
            <span className="text-xs font-medium">{role ?? "—"}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            className={`btn w-full ${location === "fridge" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setLocation("fridge")}
          >
            Frigo
          </button>
          <button
            className={`btn w-full ${location === "freezer" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setLocation("freezer")}
          >
            Congelatore
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Esempio: <span className="font-medium">salmone 2 kg #pesce loc freezer exp 10/03/2026</span>
          </div>

          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Scrivi o parla: prodotto qty unit #sezione loc exp data note..."
              disabled={!canEdit}
            />
            <button
              type="button"
              onClick={start}
              className={`btn px-3 ${status === "listening" ? "btn-primary" : "btn-ghost"}`}
              disabled={!canEdit}
              title="Parla"
            >
              🎤
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              className="input"
              value={overrideQty === "" ? String(draft.quantity) : String(overrideQty)}
              onChange={(e) => setOverrideQty(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Qty"
              disabled={!canEdit}
            />
            <select
              className="input"
              value={overrideUnit === "" ? draft.unit : overrideUnit}
              onChange={(e) => setOverrideUnit(e.target.value as Unit)}
              disabled={!canEdit}
            >
              <option value="pz">pz</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="l">l</option>
            </select>
            <input
              className="input"
              value={overrideSection || draft.section || ""}
              onChange={(e) => setOverrideSection(e.target.value)}
              placeholder="Sezione (pesce, carni...)"
              disabled={!canEdit}
            />
            <input
              className="input"
              value={overrideExp || draft.expiresAt || ""}
              onChange={(e) => setOverrideExp(e.target.value)}
              placeholder="Scadenza (YYYY-MM-DD)"
              disabled={!canEdit}
            />
          </div>

          <button className={`btn w-full ${canEdit ? "btn-gold" : "btn-ghost"}`} onClick={handleAdd} disabled={!canEdit}>
            Registra lotto
          </button>

          {!canEdit && (
            <div className="p-muted text-xs">
              Non hai permessi di modifica (solo Admin/Chef/Sous-chef/Capo partita).
            </div>
          )}
        </div>
      </div>

      <div className="card p-4 mb-6">
  <h3 className="text-sm font-semibold mb-4 tracking-wide text-neutral-600">
    STOCK TOTALE AGGREGATO
  </h3>

  {aggregated.length === 0 && (
    <div className="text-sm text-neutral-400">
      Nessun prodotto presente.
    </div>
  )}

  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {aggregated.map((item) => (
      <div
        key={item.name}
        className="rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm"
      >
        <div className="text-xs uppercase tracking-wide text-neutral-400">
          {item.name}
        </div>
        <div className="text-lg font-semibold mt-1">
          {formatSmart(item.quantity, item.baseUnit)}
        </div>
      </div>
    ))}
  </div>
</div>


      <div className="space-y-2">
        {items.map((item) => {
          const d = daysLeft(item.expiresAt);
          return (
            <div key={item.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold truncate">{item.name}</div>
                    <span className={expBadgeClass(d)}>
                      {d === null ? "no exp" : d <= 0 ? "EXP" : `${d}d`}
                    </span>
                  </div>
                  <div className="text-sm" style={{ color: "var(--muted)" }}>
                    {item.quantity} {item.unit}
                    {item.section ? ` • #${item.section}` : ""}
                    {item.expiresAt ? ` • exp ${item.expiresAt}` : ""}
                  </div>
                </div>
                {canEdit && (
                  <button className="btn btn-ghost px-3 py-2" onClick={() => removeFreezerItem(item.id)} title="Rimuovi lotto">
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

