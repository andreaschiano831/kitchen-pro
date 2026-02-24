import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useKitchen } from "../store/kitchenStore";
import { expiryLevel, expiryLabel, isUrgent } from "../utils/expiry";
import { loadMEP } from "../utils/mepStorage";

function norm(s: string) {
  return s.trim().toLowerCase();
}

export default function Search() {
  const { state } = useKitchen();
  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = norm(q);
    if (!kitchen || query.length < 1) {
      return { items: [], shopping: [], mep: [] as any[] };
    }

    const items = (kitchen.freezer || []).filter((it: any) => {
      const hay = `${it.name} ${it.category ?? ""} ${it.section ?? ""} ${it.notes ?? ""}`;
      return norm(hay).includes(query);
    });

    const shopping = (kitchen.shopping || []).filter((x: any) => {
      const hay = `${x.name} ${x.notes ?? ""} ${x.category}`;
      return norm(hay).includes(query);
    });

    const mep = (() => {
      try {
        const loaded = loadMEP(kitchen.id);
        return (loaded.tasks || []).filter((t: any) => norm(`${t.title} ${t.station ?? ""}`).includes(query));
      } catch {
        return [];
      }
    })();

    return { items, shopping, mep };
  }, [kitchen, q]);

  if (!kitchen) {
    return (
      <div className="card p-6">
        <div className="h1">Search</div>
        <div className="p-muted mt-2">Seleziona una Kitchen.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="h1">Search</div>
        <div className="p-muted text-xs mt-1">Cerca ovunque: giacenze + spesa + MEP</div>

        <div className="mt-4">
          <input
            className="input"
            placeholder="Cerca ingrediente, ricetta o fornitore…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="p-muted text-[11px] mt-2">
            Tip: usa parole secche. Risultati immediati.
          </div>
        </div>
      </div>

      {q.trim().length === 0 ? (
        <div className="card p-5">
          <div className="h2">Scorciatoie</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="btn btn-primary text-xs" to="/freezer">Vai a Giacenze</Link>
            <Link className="btn btn-gold text-xs" to="/orders">Vai a Spesa</Link>
            <Link className="btn btn-ghost text-xs" to="/mep">Vai a MEP</Link>
            <Link className="btn btn-ghost text-xs" to="/capture">Scanner rapido</Link>
          </div>
        </div>
      ) : null}

      <div className="card p-5">
        <div className="h2">Giacenze</div>
        <div className="p-muted text-xs mt-1">{results.items.length} risultati</div>

        <div className="mt-3 space-y-2">
          {results.items.slice(0, 20).map((it: any) => {
            const lev = expiryLevel(it.expiresAt);
            const urgent = isUrgent(lev);
            return (
              <div key={it.id} className="row">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{it.name}</div>
                  <div className="p-muted text-xs">
                    {it.quantity} {it.unit} • {it.location} {it.category ? `• ${it.category}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {it.expiresAt ? (
                    <span className={urgent ? "badge badge-expired" : "badge badge-warn"}>
                      {expiryLabel(lev)}
                    </span>
                  ) : (
                    <span className="badge">—</span>
                  )}
                </div>
              </div>
            );
          })}
          {results.items.length > 20 ? <div className="p-muted text-xs">…altri risultati: usa query più precisa.</div> : null}
        </div>
      </div>

      <div className="card p-5">
        <div className="h2">Spesa</div>
        <div className="p-muted text-xs mt-1">{results.shopping.length} risultati</div>
        <div className="mt-3 space-y-2">
          {results.shopping.slice(0, 20).map((x: any) => (
            <div key={x.id} className="row">
              <div className="min-w-0">
                <div className={x.checked ? "font-semibold line-through opacity-60 truncate" : "font-semibold truncate"}>
                  {x.name}
                </div>
                <div className="p-muted text-xs">
                  {x.quantity} {x.unit} • {x.category} {x.notes ? `• ${x.notes}` : ""}
                </div>
              </div>
              <span className="badge">{x.checked ? "OK" : "TODO"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="h2">MEP</div>
        <div className="p-muted text-xs mt-1">{results.mep.length} risultati</div>
        <div className="mt-3 space-y-2">
          {results.mep.slice(0, 20).map((t: any) => (
            <div key={t.id} className="row">
              <div className="min-w-0">
                <div className={t.done ? "font-semibold line-through opacity-60 truncate" : "font-semibold truncate"}>
                  {t.title}
                </div>
                <div className="p-muted text-xs">{t.station ? t.station : "—"}</div>
              </div>
              <span className="badge">{t.done ? "DONE" : "OPEN"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
