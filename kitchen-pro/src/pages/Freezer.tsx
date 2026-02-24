import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useKitchen } from "../store/kitchenStore";
import { quickAddParse } from "../utils/quickAdd";
import type { Unit } from "../types/freezer";

export default function Freezer() {
  const { state, addFreezerItem, removeFreezerItem, getCurrentRole } = useKitchen();
  const role = getCurrentRole();

  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const canEdit = role === "admin" || role === "chef" || role === "sous-chef" || role === "capo-partita";

  const [raw, setRaw] = useState("");
  const draft = useMemo(() => quickAddParse(raw), [raw]);

  const [overrideQty, setOverrideQty] = useState<number | "">( "");
  const [overrideUnit, setOverrideUnit] = useState<Unit | "">("");
  const [overrideSection, setOverrideSection] = useState("");
  const [overrideExp, setOverrideExp] = useState("");

  if (!kitchen) {
    return (
      <div className="card p-5">
        <div className="h1">Freezer</div>
        <p className="p-muted mt-2">Seleziona una kitchen prima.</p>
      </div>
    );
  }

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
            <div className="h1">Freezer</div>
            <div className="p-muted">{kitchen.name}</div>
          </div>
          <div className="badge" style={{ borderColor: "rgba(198,167,94,.6)" }}>
            <span className="text-xs font-medium">{role ?? "—"}</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="text-xs" style={{ color: "var(--muted)" }}>
            Quick Add (esempi):<br />
            <span className="font-medium">salmone 2 kg #pesce exp 10/03/2026</span><br />
            <span className="font-medium">demi-glace 3 l #salse scad 2026-03-01 note riduzione</span>
          </div>

          <input
            className="input"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Scrivi: prodotto quantità unità #sezione exp data note ..."
            disabled={!canEdit}
          />

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
              placeholder="Sezione (es. pesce, carni...)"
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

          <button className={`btn w-full ${canEdit ? "btn-primary" : "btn-ghost"}`} onClick={handleAdd} disabled={!canEdit}>
            Aggiungi
          </button>

          {!canEdit && (
            <div className="p-muted text-xs">
              Non hai permessi di modifica (solo Admin/Chef/Sous-chef/Capo partita).
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {kitchen.freezer.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">{item.name}</div>
                <div className="text-sm" style={{ color: "var(--muted)" }}>
                  {item.quantity} {item.unit}
                  {item.section ? ` • #${item.section}` : ""}
                  {item.expiresAt ? ` • exp ${item.expiresAt}` : ""}
                </div>
              </div>
              {canEdit && (
                <button className="btn btn-ghost px-3 py-2" onClick={() => removeFreezerItem(item.id)} title="Rimuovi">
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
