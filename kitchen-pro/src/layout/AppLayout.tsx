import { Link, Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import { useKitchen } from "../store/kitchenStore";

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-lg" style={{ background: "var(--red)" }} />
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">Kitchen Pro</div>
        <div className="text-[11px]" style={{ color: "var(--muted)" }}>Michelin workflow</div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { state, getCurrentRole } = useKitchen();
  const location = useLocation();
  const kitchen = state.kitchens.find((k) => k.id === state.currentKitchenId);
  const role = getCurrentRole();

  const isJoin = location.pathname.startsWith("/join");
  if (isJoin) return <Outlet />;

  return (
    <div className="min-h-screen pb-16">
      <header className="topbar">
        <div className="container-pro py-3 flex items-center justify-between gap-3">
          <Brand />

          <div className="flex items-center gap-2">
            <Link to="/kitchen" className="btn btn-ghost px-3 py-2 text-xs">Kitchen</Link>
            <Link to="/switch" className="btn btn-ghost px-3 py-2 text-xs">Switch</Link>
          </div>
        </div>

        <div className="container-pro pb-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs" style={{ color: "var(--muted)" }}>Kitchen</div>
            <div className="truncate text-sm font-medium">{kitchen?.name ?? "—"}</div>
          </div>
          <div className="badge" style={{ borderColor: "rgba(198,167,94,.6)" }}>
            <span className="text-xs font-medium">{role ?? "no-role"}</span>
          </div>
        </div>
      </header>

      <main className="container-pro py-6">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
