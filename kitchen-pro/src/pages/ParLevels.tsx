import { useEffect, useMemo, useState } from "react";
import type { Unit } from "../types/freezer";
import { loadParLevels, saveParLevels, setParLevel, removeParLevel } from "../utils/parLevels";

const UNITS: Unit[] = ["pz", "g", "kg", "ml", "l"];

export default function ParLevels() {
  const [levels, setLevels] = useState(loadParLevels());

  const [name, setName] = useState("");
  const [minQty, setMinQty] = useState<number>(1);
  const [minUnit, setMinUnit] = useState<Unit>("pz");

  useEffect(() => {
    saveParLevels(levels);
  }, [levels]);

  const sorted = useMemo(() => levels.slice().sort((a,b) => a.name.localeCompare(b.name)), [levels]);

  function addOrUpdate() {
    const n = name.trim();
    if (!n) return;
    if (!Number.isFinite(minQty) || minQty <= 0) return;
    setLevels(prev => setParLevel(prev, n, minQty, minUnit));
    setName("");
    setMinQty(1);
    setMinUnit("pz");
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="h1">Par Levels</div>
        <p className="p-muted mt-2">
          Imposta soglie minime per alert automatici (peso/volume convertiti: kg→g, l→ml).
        </p>
      </div>

      <div className="card p-5 space-y-3">
        <div className="h2">Aggiungi / aggiorna soglia</div>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome prodotto (es. salmone)" />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" type="number" min={0} step={0.01} value={minQty} onChange={(e) => setMinQty(Number(e.target.value))} />
          <select className="input" value={minUnit} onChange={(e) => setMinUnit(e.target.value as Unit)}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <button className="btn btn-primary w-full" onClick={addOrUpdate}>Salva soglia</button>
      </div>

      <div className="card p-5">
        <div className="h2 mb-3">Soglie attive</div>
        {sorted.length === 0 ? (
          <div className="p-muted">Nessuna soglia impostata.</div>
        ) : (
          <div className="space-y-2">
            {sorted.map(l => (
              <div key={l.name} className="flex items-center justify-between gap-3 border rounded-xl px-3 py-2" style={{ borderColor: "var(--line)" }}>
                <div className="min-w-0">
                  <div className="font-medium truncate">{l.name}</div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>min {l.minQty} {l.minUnit}</div>
                </div>
                <button className="btn btn-ghost px-3 py-2 text-xs" onClick={() => setLevels(prev => removeParLevel(prev, l.name))}>
                  Rimuovi
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
