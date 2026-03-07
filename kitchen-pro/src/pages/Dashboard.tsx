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

    const expired = inv.filter((it: any) => {
      const h = hoursUntil(it.expiresAt);
      return h !== null && h <= 0;
    });

    const urgent24 = inv.filter((it: any) => {
      const h = hoursUntil(it.expiresAt);
      return h !== null && h <= 24 && h > 0;
    });

    const urgent72 = inv.filter((it: any) => {
      const h = hoursUntil(it.expiresAt);
      return h !== null && h <= 72 && h > 24;
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
      expired: expired.length,
      urgent24: urgent24.length,
      urgent72: urgent72.length,
      low: low.length,
      toBuy: toBuy.length,
      members: (kitchen.members || []).length,
      kitchenName: kitchen.name,
    };
  }, [kitchen]);

  if (!kitchen || !stats) {
    return (
      <div className="card p-6">
        <div className="h1">Kitchen Pro</div>
        <div className="p-muted mt-2">Crea o seleziona una Kitchen per partire.</div>
        <Link className="btn btn-primary mt-4" to="/kitchen">Vai a Kitchen</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h1">Kitchen Pro</div>
            <div className="p-muted mt-1">{stats.kitchenName} • Membri: {stats.members}</div>
          </div>
          <Link className="btn btn-gold" to="/orders">Export DOC</Link>
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
          <div className="kpi" style={{ color: "#7f1d1d" }}>{stats.expired}</div>
          <div className="p-muted text-xs mt-1">Azione immediata</div>
        </div>

        <div className="card p-4 border border-amber-200">
          <div className="kpi-label">Urgenti</div>
          <div className="kpi">{stats.urgent24 + stats.urgent72}</div>
          <div className="p-muted text-xs mt-1">≤24h: {stats.urgent24} • 24–72h: {stats.urgent72}</div>
        </div>

        <div className="card p-4 border border-red-200">
          <div className="kpi-label">LOW stock (pz)</div>
          <div className="kpi" style={{ color: "#991b1b" }}>{stats.low}</div>
          <div className="p-muted text-xs mt-1">Sotto MIN (default 5)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card p-5">
          <div className="h2">Azioni rapide</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="btn btn-primary" to="/inventory">Giacenze</Link>
            <Link className="btn btn-ghost" to="/mep">MEP</Link>
            <Link className="btn btn-ghost" to="/orders">Spesa</Link>
            <Link className="btn btn-ghost" to="/members">Team</Link>
          </div>
        </div>

        <div className="card p-5">
          <div className="h2">Spesa</div>
          <div className="p-muted mt-1">Da acquistare (non checkati)</div>
          <div className="kpi mt-3">{stats.toBuy}</div>
          <Link className="btn btn-gold mt-3" to="/orders">Apri liste spesa</Link>
        </div>
      </div>
    </div>
  );
}
