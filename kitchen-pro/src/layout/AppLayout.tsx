import { Outlet, Link } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen pb-16 bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <h1 className="text-sm font-semibold tracking-wide">Kitchen Pro</h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-300">
            <Link to="/kitchen" className="hover:text-white">Kitchen</Link>
            <Link to="/auth" className="hover:text-white">Auth</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-4">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
