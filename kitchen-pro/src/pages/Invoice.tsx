/**
 * Invoice.tsx — Scanner fattura: testo OCR → carichi + lotti
 * Nessuna API esterna. L'utente incolla il testo, vede le righe parsate,
 * le corregge inline, poi conferma → stockAdd per ogni riga.
 */

import { useMemo, useState } from "react";
import { useKitchen } from "../store/kitchenStore";
import { parseInvoice, type InvoiceLine } from "../utils/invoiceParser";
import { CATALOG, CATEGORY_KEYS, CATEGORY_LABELS } from "../data/catalog";
import type { Location, Unit } from "../types/freezer";
import type { CategoryKey } from "../data/catalog";

const UNITS: Unit[] = ["pz","g","kg","ml","l","vac","busta","brik","latta","box","vasch"];
const LOCS: { v: Location; l: string }[] = [
  { v: "freezer", l: "❄️ Freezer" },
  { v: "fridge",  l: "🌡️ Frigo"   },
  { v: "dry",     l: "📦 Dispensa" },
  { v: "counter", l: "🔪 Banco"    },
];
const today = () => new Date().toISOString().slice(0, 10);

type Row = InvoiceLine & {
  catalogId: string;
  location: Location;
  productionDate: string;
  skip: boolean;
};

export default function Invoice() {
  const { stockAdd, state } = useKitchen();
  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const [ocr,    setOcr]    = useState("");
  const [rows,   setRows]   = useState<Row[]>([]);
  const [step,   setStep]   = useState<"input" | "review" | "done">("input");
  const [saved,  setSaved]  = useState(0);
  const [catFilter, setCatFilter] = useState<CategoryKey | "">("");

  // catalog filtered for select
  const catalogOptions = useMemo(
    () => catFilter ? CATALOG.filter((x) => x.categoryKey === catFilter) : CATALOG,
    [catFilter]
  );

  function parse() {
    const lines = parseInvoice(ocr);
    const mapped: Row[] = lines.map((l) => {
      // try to match catalog by name similarity
      const nameLower = l.nameGuess.toLowerCase();
      const matched   = CATALOG.find((c) =>
        nameLower.includes(c.name.toLowerCase().split(" ")[0])
      );
      return {
        ...l,
        catalogId:      matched?.id ?? "",
        location:       matched?.defaultLocation ?? "fridge",
        productionDate: today(),
        skip:           false,
      };
    });
    setRows(mapped);
    setStep("review");
  }

  function setRow<K extends keyof Row>(i: number, key: K, val: Row[K]) {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  }

  function onCatalogChange(i: number, catalogId: string) {
    const item = CATALOG.find((c) => c.id === catalogId);
    setRows((prev) => prev.map((r, idx) =>
      idx !== i ? r : {
        ...r,
        catalogId,
        nameGuess: item?.name ?? r.nameGuess,
        location:  item?.defaultLocation ?? r.location,
      }
    ));
  }

  function confirm() {
    if (!kitchen) return;
    let n = 0;
    for (const r of rows) {
      if (r.skip) continue;
      const item = CATALOG.find((c) => c.id === r.catalogId);
      stockAdd({
        name:          r.nameGuess,
        quantity:      r.qty,
        unit:          r.unitGuess,
        location:      r.location,
        insertedAt:    new Date().toISOString(),
        insertedDate:  r.productionDate,
        expiresAt:     r.expiresGuess || undefined,
        lot:           r.lotGuess || `LOT-${r.productionDate}`,
        catalogId:     r.catalogId || undefined,
        category:      item?.categoryKey,
      });
      n++;
    }
    setSaved(n);
    setStep("done");
  }

  if (!kitchen) return (
    <div className="card p-8 empty-state">
      <div className="empty-icon">📄</div>
      <div className="empty-title">Nessuna cucina attiva</div>
    </div>
  );

  // ── DONE ───────────────────────────────────────────────────────────────────
  if (step === "done") return (
    <div className="card p-8 empty-state">
      <div className="empty-icon">✅</div>
      <div className="empty-title">{saved} prodotti caricati</div>
      <button className="btn btn-primary mt-4" onClick={() => { setOcr(""); setRows([]); setStep("input"); }}>
        Nuova fattura
      </button>
    </div>
  );

  // ── REVIEW ─────────────────────────────────────────────────────────────────
  if (step === "review") {
    const active = rows.filter((r) => !r.skip).length;
    return (
      <div className="space-y-4">
        <div className="card p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="h1">Revisione fattura</div>
            <div className="p-muted text-xs mt-1">{rows.length} righe parsate · {active} da caricare</div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost text-sm" onClick={() => setStep("input")}>← Modifica testo</button>
            <button className="btn btn-primary text-sm" onClick={confirm} disabled={active === 0}>
              ✅ Conferma e carica ({active})
            </button>
          </div>
        </div>

        {/* filtro categoria per il select prodotto */}
        <div className="card p-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs p-muted">Filtra catalogo per:</span>
          <select className="input text-sm" value={catFilter} onChange={(e) => setCatFilter(e.target.value as CategoryKey | "")}>
            <option value="">Tutte le categorie</option>
            {CATEGORY_KEYS.map((k) => <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className={`card p-3 space-y-2 ${r.skip ? "opacity-40" : ""}`}>
              {/* row header */}
              <div className="flex items-start gap-2">
                <input type="checkbox" checked={!r.skip}
                  onChange={() => setRow(i, "skip", !r.skip)}
                  className="mt-1 h-4 w-4 accent-neutral-800 flex-shrink-0" />
                <div className="text-[11px] p-muted truncate flex-1" title={r.raw}>{r.raw}</div>
              </div>

              {!r.skip && (
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 pl-6">
                  {/* prodotto */}
                  <div className="sm:col-span-2 md:col-span-2">
                    <label className="text-[10px] p-muted block mb-0.5">Prodotto catalogo</label>
                    <select className="input w-full text-sm" value={r.catalogId}
                      onChange={(e) => onCatalogChange(i, e.target.value)}>
                      <option value="">— libero: {r.nameGuess} —</option>
                      {catalogOptions.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* qty + unit */}
                  <div className="flex gap-1">
                    <div className="flex-1">
                      <label className="text-[10px] p-muted block mb-0.5">Qty</label>
                      <input className="input w-full text-sm" type="number" min={0} step={0.1}
                        value={r.qty} onChange={(e) => setRow(i, "qty", parseFloat(e.target.value || "0"))} />
                    </div>
                    <div className="w-20">
                      <label className="text-[10px] p-muted block mb-0.5">Unità</label>
                      <select className="input w-full text-sm" value={r.unitGuess}
                        onChange={(e) => setRow(i, "unitGuess", e.target.value as Unit)}>
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* location */}
                  <div>
                    <label className="text-[10px] p-muted block mb-0.5">Location</label>
                    <select className="input w-full text-sm" value={r.location}
                      onChange={(e) => setRow(i, "location", e.target.value as Location)}>
                      {LOCS.map((l) => <option key={l.v} value={l.v}>{l.l}</option>)}
                    </select>
                  </div>

                  {/* lotto */}
                  <div>
                    <label className="text-[10px] p-muted block mb-0.5">Lotto</label>
                    <input className="input w-full text-sm" value={r.lotGuess}
                      onChange={(e) => setRow(i, "lotGuess", e.target.value)}
                      placeholder="LOT-…" />
                  </div>

                  {/* data produzione */}
                  <div>
                    <label className="text-[10px] p-muted block mb-0.5">Data produzione</label>
                    <input className="input w-full text-sm" type="date" value={r.productionDate}
                      onChange={(e) => setRow(i, "productionDate", e.target.value)} />
                  </div>

                  {/* scadenza */}
                  <div>
                    <label className="text-[10px] p-muted block mb-0.5">Scadenza</label>
                    <input className="input w-full text-sm" type="date" value={r.expiresGuess}
                      onChange={(e) => setRow(i, "expiresGuess", e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── INPUT ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="h1">Scanner Fattura</div>
        <div className="p-muted text-xs mt-1">
          Incolla il testo OCR della fattura. L'app propone prodotto/qty/lotto per ogni riga.
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <label className="text-xs p-muted block">Testo fattura (OCR o manuale)</label>
        <textarea
          className="input w-full font-mono text-sm"
          rows={14}
          value={ocr}
          onChange={(e) => setOcr(e.target.value)}
          placeholder={"Manzo scottona kg 10,5 Lotto AB123 Sc. 2026-03-01\nUova fresche cat.A 6 pz\nBurro 82% 500 g L240225A1\nBranzino intero 3,5 kg 04/2026"}
        />
        <button
          className={"btn btn-primary w-full " + (!ocr.trim() ? "opacity-40 cursor-not-allowed" : "")}
          disabled={!ocr.trim()}
          onClick={parse}
        >
          🔍 Analizza fattura
        </button>
      </div>
    </div>
  );
}
