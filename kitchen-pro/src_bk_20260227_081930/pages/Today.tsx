import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useKitchen } from "../store/kitchenStore";
import { expiryLevel, expiryLabel, isUrgent } from "../utils/expiry";

export default function Today() {
  const { state } = useKitchen();

  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const items = kitchen?.freezer ?? [];

  const urgent = useMemo(() => {
    return items
      .filter((x) => isUrgent(expiryLevel(x.expiresAt)))
      .slice(0, 6);
  }, [items]);

  const low = useMemo(() => {
    return items
      .filter((x: any) => x.unit === "pz" && (x.quantity ?? 0) < Number(x.parLevel ?? 5))
      .slice(0, 6);
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="h2">Cucina attiva</div>
        <div className="mt-1 text-sm">
          {kitchen ? (
            <>
              <span className="font-semibold">{kitchen.name}</span>
              <span className="p-muted"> — pronto per operatività</span>
            </>
          ) : (
            <span className="p-muted">Seleziona una kitchen per iniziare.</span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="btn btn-primary" to="/freezer">Vai a Stock</Link>
          <Link className="btn btn-ghost" to="/orders">Apri Orders</Link>
          <Link className="btn btn-ghost" to="/mep">Apri MEP</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="h2">Search</div>
          <div className="p-muted text-sm mt-1">Cerca ingrediente, ricetta o fornitore…</div>
          <div className="mt-3">
            <Link to="/search" className="btn btn-ghost w-full">Apri Search</Link>
          </div>
        </div>

        <div className="card p-4">
          <div className="h2">Scanner</div>
          <div className="p-muted text-sm mt-1">Inquadra l’etichetta per registrare</div>
          <div className="mt-3">
            <Link to="/capture" className="btn btn-gold w-full">Apri Scanner</Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="h2">Scadenze urgenti</div>
          {urgent.length == 0 ? (
            <div className="p-muted text-sm mt-2">Nessun urgente (oggi/24h/72h).</div>
          ) : (
            <div className="mt-3 space-y-2">
              {urgent.map((x: any) => (
                <div key={x.id} className="row">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{x.name}</div>
                    <div className="p-muted text-xs">{expiryLabel(expiryLevel(x.expiresAt))}</div>
                  </div>
                  <span className="badge">URGENTE</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4">
          <div className="h2">Low stock (pz)</div>
          {low.length == 0 ? (
            <div className="p-muted text-sm mt-2">Nessuna giacenza sotto MIN.</div>
          ) : (
            <div className="mt-3 space-y-2">
              {low.map((x: any) => (
                <div key={x.id} className="row">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{x.name}</div>
                    <div className="p-muted text-xs">QTY: {x.quantity} • MIN: {x.parLevel ?? 5}</div>
                  </div>
                  <span className="badge" style={{ borderColor: "rgba(122,12,12,.35)", background: "rgba(122,12,12,.06)", color: "var(--accent)" }}>
                    LOW
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
