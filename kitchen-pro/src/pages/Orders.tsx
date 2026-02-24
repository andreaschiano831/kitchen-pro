import { useMemo, useState } from "react";
import ExportPreviewModal from "../components/ExportPreviewModal";
import { useKitchen, type ShoppingCategory } from "../store/kitchenStore";
import type { Unit } from "../types/freezer";
import { buildKitchenReportHtml, buildUrgentReportHtml, exportEconomatoCSV } from "../utils/export";

const CATS: { key: ShoppingCategory; label: string }[] = [
  { key: "economato", label: "Economato" },
  { key: "giornaliero", label: "Giornaliera" },
  { key: "settimanale", label: "Settimanale" },
];

export default function Orders() {
  const [exportOpen, setExportOpen] = useState(false);
  const [exportHtml, setExportHtml] = useState("");
  const [exportName, setExportName] = useState("kitchen-report.doc");

  const { state, getCurrentRole, shopAdd, shopToggle, shopRemove, shopClearChecked } = useKitchen();
  const role = getCurrentRole();
  const canEdit = role === "admin" || role === "chef" || role === "sous-chef" || role === "capo-partita";

  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const [cat, setCat] = useState<ShoppingCategory>("economato");
  const [name, setName] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>("pz");
  const [notes, setNotes] = useState("");

  const list = useMemo(() => {
    if (!kitchen) return [];
    return (kitchen.shopping || [])
      .filter((x) => x.category === cat)
      .slice()
      .sort((a, b) => Number(a.checked) - Number(b.checked) || a.name.localeCompare(b.name));
  }, [kitchen, cat]);

  function add() {
    if (!canEdit || !kitchen) return;
    const n = name.trim();
    if (!n) return;
    const qn = Number(qty);
    if (!Number.isFinite(qn) || qn <= 0) return;

    shopAdd(n, qn, unit, cat, notes.trim() || undefined);
    setName("");
    setQty(1);
    setUnit("pz");
    setNotes("");
  }

  if (!kitchen) {
    return (
      <div className="card p-5">
        <div className="h1">Liste Spesa</div>
        <div className="p-muted mt-2">Seleziona una kitchen prima (Kitchen).</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="h1">Liste Spesa</div>

          <div className="flex gap-2">
            <button
              className="btn btn-ghost px-3 py-2 text-xs"
              onClick={() => /*removed*/(kitchen)}
            >
              Export DOC (Report)
            </button>
            <button
              className="btn btn-ghost px-3 py-2 text-xs"
              onClick={() => shopClearChecked(cat)}
              disabled={!canEdit}
            >
              Clear checked
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c.key}
              className={`btn px-4 py-2 ${cat === c.key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setCat(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="input md:col-span-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Prodotto" disabled={!canEdit} />
          <input className="input" type="number" min={1} step={unit === "pz" ? 1 : 0.01} value={qty} onChange={(e) => setQty(Number(e.target.value))} disabled={!canEdit} />
          <select className="input" value={unit} onChange={(e) => setUnit(e.target.value as Unit)} disabled={!canEdit}>
            <option value="pz">pz</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
          </select>
          <input className="input md:col-span-2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note (marca, pezzatura, consegna...)" disabled={!canEdit} />
        </div>

        <div className="mt-3">
          <button className={`btn ${canEdit ? "btn-primary" : "btn-ghost"}`} onClick={add} disabled={!canEdit}>
            Aggiungi
          </button>
          {!canEdit && <div className="p-muted text-xs mt-2">Solo ruoli senior possono modificare</div>}
        </div>
      </div>

      <div className="space-y-2">
        {list.length === 0 && (
          <div className="card p-4">
            <div className="p-muted">Lista vuota.</div>
          </div>
        )}

        {list.map((it) => (
          <div key={it.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <button className={`btn px-3 py-2 ${it.checked ? "btn-gold" : "btn-ghost"}`} onClick={() => shopToggle(it.id)} disabled={!canEdit}>
                    {it.checked ? "✓" : "○"}
                  </button>

                  <div className="min-w-0">
                    <div className={`font-semibold truncate ${it.checked ? "line-through opacity-70" : ""}`}>
                      {it.name}
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {it.quantity} {it.unit}{it.notes ? ` • ${it.notes}` : ""}
                    </div>
                  </div>
                </div>
              </div>

              {canEdit && (
                <button className="btn btn-ghost px-3 py-2" onClick={() => shopRemove(it.id)} title="Rimuovi">
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
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
