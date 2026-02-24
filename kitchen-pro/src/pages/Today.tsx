import { useMemo } from "react";
import { useKitchen } from "../store/kitchenStore";
import { expiryLevel, isUrgent } from "../utils/expiry";

export default function Today() {
  const { state } = useKitchen();
  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const stats = useMemo(() => {
    if (!kitchen) return { urgent: 0, low: 0, econ: 0 };
    const items = kitchen.freezer || [];

    const urgent = items.filter((it: any) => isUrgent(expiryLevel(it.expiresAt))).length;

    const low = items.filter((it: any) => {
      if (it.unit !== "pz") return false;
      const min = (it.parLevel ?? 5);
      return Number(it.quantity || 0) < Number(min);
    }).length;

    const econ = (kitchen.shopping || []).filter((x: any) => x.category === "economato" && !x.checked).length;
    return { urgent, low, econ };
  }, [kitchen]);

  if (!kitchen) {
    return (
      <div className="card p-6">
        <div className="h1">Today</div>
        <div className="p-muted mt-2">Seleziona una Kitchen per vedere il cruscotto.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="h1">Today</div>
        <div className="p-muted text-xs mt-1">Controllo rapido: urgenze, low stock, economato</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="card p-4">
            <div className="p-muted text-xs">Scadenze urgenti</div>
            <div className="text-3xl font-extrabold mt-1">{stats.urgent}</div>
            <div className="p-muted text-xs mt-2">Oggi / 24h / 72h</div>
          </div>

          <div className="card p-4">
            <div className="p-muted text-xs">LOW stock (pz)</div>
            <div className="text-3xl font-extrabold mt-1">{stats.low}</div>
            <div className="p-muted text-xs mt-2">Sotto MIN (default 5)</div>
          </div>

          <div className="card p-4">
            <div className="p-muted text-xs">Economato da comprare</div>
            <div className="text-3xl font-extrabold mt-1">{stats.econ}</div>
            <div className="p-muted text-xs mt-2">Non spuntati</div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="h2">Routine consigliata</div>
        <div className="p-muted text-sm mt-2 space-y-1">
          <div>1) Apri <b>Freezer</b> → attiva “Solo urgenti” e sistema le scadenze.</div>
          <div>2) Verifica <b>LOW stock</b> → genera economato e conferma quantità.</div>
          <div>3) Vai su <b>Orders</b> → export DOC per condividere.</div>
        </div>
      </div>
    </div>
  );
}
