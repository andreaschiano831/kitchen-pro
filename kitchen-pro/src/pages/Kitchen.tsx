import { useMemo, useState } from "react";
import { useKitchen } from "../store/kitchenStore";

const PAR_ROWS: { key: string; label: string; examples: string; def: number }[] = [
  { key: "proteine", label: "Proteine animali", examples: "piccione, astice, wagyu, animelle", def: 6 },
  { key: "pesce", label: "Pesce & molluschi", examples: "rombo, capesante, ricci, polpo", def: 4 },
  { key: "verdure", label: "Verdure & radici", examples: "topinambur, scorzonera, cavolo nero", def: 8 },
  { key: "erbe", label: "Erbe & fiori", examples: "acetosella, borragine, fiori di zucca", def: 12 },
  { key: "latticini", label: "Latticini & uova", examples: "burro Bordier, panna cruda, uova", def: 6 },
  { key: "cereali", label: "Farine & cereali", examples: "farro monococco, semola Cappelli", def: 3 },
  { key: "grassi", label: "Grassi & oli", examples: "EVO, lardo Colonnata, burro chiarificato", def: 4 },
  { key: "fermentati", label: "Acidi & fermentati", examples: "aceto, koji, miso, kombucha", def: 6 },
  { key: "spezie", label: "Spezie & aromi secchi", examples: "pepe lungo, sumac, cardamomo", def: 10 },
  { key: "fondi", label: "Fondi & riduzioni", examples: "fondo bruno, dashi, bisque, glace", def: 4 },
  { key: "cantina", label: "Cantina & beverage", examples: "vini, sake, distillati da cucina", def: 6 },
  { key: "consumabili", label: "Consumabili & secco", examples: "carta forno, agar, lecitina", def: 5 },
  { key: "default", label: "Default", examples: "fallback se categoria mancante", def: 5 },
];

export default function Kitchen() {
  const { state, createKitchen, selectKitchen, setParCategory } = useKitchen();
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("Admin");

  const currentKitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const parMap: Record<string, number> = (currentKitchen as any)?.parByCategory || { default: 5 };

  function onCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    createKitchen(trimmed, (ownerName || "").trim() || "Admin");
    setName("");
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="h2">Kitchen Management</div>
        <div className="p-muted text-xs mt-1">Seleziona o crea una cucina (ID) e gestisci soglie MIN (pz).</div>

        <div className="mt-3 flex gap-2">
          <input
            className="input flex-1"
            placeholder="Nome cucina (es. Cucina Principale)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn btn-primary" onClick={onCreate}>Crea</button>
        </div>

        <div className="mt-4 space-y-2">
          {state.kitchens.length === 0 ? (
            <div className="p-muted text-sm">Nessuna kitchen. Creane una.</div>
          ) : (
            state.kitchens.map((k) => (
              <button
                key={k.id}
                className={"row w-full " + (k.id === state.currentKitchenId ? "ring-1 ring-black/10" : "")}
                onClick={() => selectKitchen(k.id)}
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">{k.name}</div>
                  <div className="p-muted text-xs truncate">{k.id}</div>
                </div>
                <span className="badge">{k.id === state.currentKitchenId ? "Attiva" : "Apri"}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="card p-4">
        <div className="h2">Par Levels — Michelin preset (solo PZ)</div>
        <div className="p-muted text-xs mt-1">
          Sotto MIN: flag rosso (dashboard) e pronto per riordino automatico. Default=5.
        </div>

        {!currentKitchen ? (
          <div className="p-muted text-sm mt-3">Seleziona una kitchen per modificare i Par Levels.</div>
        ) : (
          <div className="mt-3 space-y-2">
            {PAR_ROWS.map((r) => {
              const cur = Number(parMap[r.key] ?? r.def);
              return (
                <div key={r.key} className="row">
                  <div className="min-w-0">
                    <div className="font-semibold">{r.label}</div>
                    <div className="p-muted text-xs">{r.examples}</div>
                  </div>

                  <input
                    className="input w-20 text-center"
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={cur}
                    onBlur={(e) => {
                      const v = Math.max(0, Math.floor(Number(e.target.value || cur)));
                      setParCategory(r.key, v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
