import { useMemo, useState } from "react";
import { useKitchen, type ShoppingCategory } from "../store/kitchenStore";
import type { Unit } from "../types/freezer";
import ExportPreviewModal from "../components/ExportPreviewModal";
import { buildKitchenReportHtml, buildUrgentReportHtml, exportEconomatoCSV } from "../utils/export";

const CATS: { key: ShoppingCategory; label: string }[] = [
  { key: "economato", label: "Economato" },
  { key: "giornaliero", label: "Giornaliera" },
  { key: "settimanale", label: "Settimanale" },
];

export default function Orders() {
  const { state, getCurrentRole, shopAdd, shopToggle, shopRemove, shopClearChecked } = useKitchen();
  const role = getCurrentRole();
  const canEdit =
    role === "admin" || role === "chef" || role === "sous-chef" || role === "capo-partita";

  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const [cat, setCat] = useState<ShoppingCategory>("economato");
  const [name, setName] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>("pz");
  const [notes, setNotes] = useState("");

  const [exportOpen, setExportOpen] = useState(false);
  const [exportHtml, setExportHtml] = useState("");
  const [exportName, setExportName] = useState("kitchen-report.doc");

  const items = useMemo(() => {
    const list = (kitchen?.shopping || []).filter((x) => x.category === cat);
    // ordina: non-checked prima, poi nome
    return list.slice().sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }, [kitchen, cat]);

  function add() {
    if (!kitchen || !canEdit) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const q = Math.max(1, Math.floor(Number(qty) || 1));
    shopAdd(trimmed, q, unit, cat, notes.trim() || undefined);
    setName("");
    setQty(1);
    setUnit("pz");
    setNotes("");
  }

  function openReport(kind: "full" | "urgent") {
    if (!kitchen) return;
    const today = new Date().toISOString().slice(0, 10);
    const html = kind === "full" ? buildKitchenReportHtml(kitchen) : buildUrgentReportHtml(kitchen);
    setExportHtml(html);
    setExportName(
      kind === "full"
        ? `kitchen-report-${kitchen.name}-${today}.doc`
        : `kitchen-urgent-${kitchen.name}-${today}.doc`
    );
    setExportOpen(true);
  }

  if (!kitchen) {
    return (
      <div className="card p-6">
        <div className="h1">Orders</div>
        <div className="p-muted mt-2">Seleziona una Kitchen.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h1">Orders</div>
            <div className="p-muted text-xs mt-1">Liste spesa + export professionale</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ghost text-xs" onClick={() => exportEconomatoCSV(kitchen)}>
              Export CSV (Economato)
            </button>
            <button className="btn btn-gold text-xs" onClick={() => openReport("full")}>
              Anteprima DOC (Report)
            </button>
            <button className="btn btn-primary text-xs" onClick={() => openReport("urgent")}>
              Anteprima DOC (Urgenti)
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c.key}
              className={cat === c.key ? "btn btn-primary text-xs" : "btn btn-ghost text-xs"}
              onClick={() => setCat(c.key)}
            >
              {c.label}
            </button>
          ))}

          <div className="flex-1" />

          <button
            className="btn btn-ghost text-xs"
            onClick={() => shopClearChecked(cat)}
            disabled={!canEdit}
          >
            Pulisci spuntati
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-10 gap-2">
          <input
            className="input md:col-span-4"
            placeholder="Nuovo articolo…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canEdit}
          />
          <input
            className="input md:col-span-1"
            type="number"
            min={1}
            step={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            disabled={!canEdit}
          />
          <select
            className="input md:col-span-1"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            disabled={!canEdit}
          >
            <option value="pz">pz</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
          </select>

          <input
            className="input md:col-span-3"
            placeholder="Note (opzionale)…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!canEdit}
          />

          <button className="btn btn-primary md:col-span-1" onClick={add} disabled={!canEdit}>
            +
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="card p-4">
            <div className="p-muted">Nessun elemento in lista.</div>
          </div>
        ) : null}

        {items.map((x) => (
          <div key={x.id} className="card p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={x.checked}
                  onChange={() => shopToggle(x.id)}
                  disabled={!canEdit}
                />
                <div className={x.checked ? "line-through opacity-60 font-semibold" : "font-semibold"}>
                  {x.name}
                </div>
              </div>
              <div className="p-muted text-xs mt-1">
                {x.quantity} {x.unit} {x.notes ? `• ${x.notes}` : ""}
              </div>
            </div>

            {canEdit ? (
              <button className="btn btn-ghost text-xs" onClick={() => shopRemove(x.id)}>
                Rimuovi
              </button>
            ) : (
              <div className="p-muted text-xs">Solo lettura</div>
            )}
          </div>
        ))}
      </div>

      <ExportPreviewModal
        open={exportOpen}
        title="Export Report (DOC)"
        defaultFilename={exportName}
        initialHtml={exportHtml}
        onClose={() => setExportOpen(false)}
      />
    </div>
  );
}
