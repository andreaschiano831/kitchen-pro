import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useKitchen } from "../store/kitchenStore";

function hoursUntil(iso?: string) {
  if (!iso) return null as number | null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null as number | null;
  return Math.floor((t - Date.now()) / (1000 * 60 * 60));
}

function minStock(item: any) {
  const unit = String(item.unit || "pz");
  if (unit !== "pz") return null as number | null;
  const v = item.parLevel;
  if (v === undefined || v === null) return 5;
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n <= 0) return 5;
  return n;
}

export default function Dashboard() {
  const { state } = useKitchen();

  const kitchen = useMemo(
    () => state.kitchens.find((k) => k.id === state.currentKitchenId),
    [state.kitchens, state.currentKitchenId]
  );

  const stats = useMemo(() => {
    if (!kitchen) return null;

    const inv = (kitchen.freezer || []).slice();

    const urgent72 = inv.filter((it: any) => {
      const h = hoursUntil(it.expiresAt);
      return h !== null && h <= 72;
    });

    const urgent24 = inv.filter((it: any) => {
      const h = hoursUntil(it.expiresAt);
      return h !== null && h <= 24;
    });

    const expired = inv.filter((it: any) => {
      const h = hoursUntil(it.expiresAt);
      return h !== null && h <= 0;
    });

    const low = inv.filter((it: any) => {
      const ms = minStock(it);
      return ms !== null && Number(it.quantity) < Number(ms);
    });

    const freezer = inv.filter((it: any) => String(it.location || "freezer") === "freezer");
    const fridge = inv.filter((it: any) => String(it.location || "freezer") === "fridge");

    const shopping = kitchen.shopping || [];
    const toBuy = shopping.filter((x) => !x.checked);

    return {
      totalInv: inv.length,
      freezer: freezer.length,
      fridge: fridge.length,
      urgent72: urgent72.length,
      urgent24: urgent24.length,
      expired: expired.length,
      low: low.length,
      toBuy: toBuy.length,
      members: (kitchen.members || []).length,
      kitchenName: kitchen.name,
    };
  }, [kitchen]);

  if (!kitchen || !stats) {
    return (
      <div className="card p-6">
        <div className="h1">Dashboard</div>
        <div className="p-muted mt-2">Seleziona o crea una Kitchen per iniziare.</div>
        <Link className="btn btn-primary mt-4 inline-flex" to="/kitchen">Vai a Kitchen</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h1">Dashboard</div>
            <div className="p-muted mt-1">{stats.kitchenName} • Membri: {stats.members}</div>
          </div>

          <Link className="btn btn-gold" to="/orders">Export + Spesa</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="kpi-label">Inventario</div>
          <div className="kpi">{stats.totalInv}</div>
          <div className="p-muted text-xs mt-1">Freezer {stats.freezer} • Fridge {stats.fridge}</div>
        </div>

        <div className="card p-4 border border-red-200">
          <div className="kpi-label">Scaduti/Oggi</div>
          <div className="kpi text-red-700">{stats.expired}</div>
          <div className="p-muted text-xs mt-1">Richiede azione</div>
        </div>

        <div className="card p-4 border border-amber-200">
          <div className="kpi-label">Urgenti ≤72h</div>
          <div className="kpi">{stats.urgent72}</div>
          <div className="p-muted text-xs mt-1">≤24h: {stats.urgent24}</div>
        </div>

        <div className="card p-4 border border-red-200">
          <div className="kpi-label">LOW stock (pz)</div>
          <div className="kpi text-red-700">{stats.low}</div>
          <div className="p-muted text-xs mt-1">Sotto MIN (default 5)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card p-5">
          <div className="font-semibold">Azioni rapide</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="btn btn-primary" to="/freezer">Giacenze</Link>
            <Link className="btn btn-ghost" to="/orders">Liste Spesa</Link>
            <Link className="btn btn-ghost" to="/mep">Preparazioni (MEP)</Link>
            <Link className="btn btn-ghost" to="/members">Team</Link>
          </div>
          <div className="p-muted text-xs mt-3">Obiettivo: un clic per operazioni critiche.</div>
        </div>

        <div className="card p-5">
          <div className="font-semibold">Spesa</div>
          <div className="mt-2 p-muted">Items da acquistare (non checkati):</div>
          <div className="kpi mt-2">{stats.toBuy}</div>
          <div className="mt-3">
            <Link className="btn btn-gold" to="/orders">Apri liste spesa</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
