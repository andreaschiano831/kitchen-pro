import { Link, useLocation } from "react-router-dom";
import { useKitchen } from "../store/kitchenStore";

export default function TopBar() {
  const { state } = useKitchen();
  const loc = useLocation();
  const kitchen = state.kitchens.find((k) => k.id === state.currentKitchenId);

  const title = (() => {
    if (loc.pathname.startsWith("/inventory")) return "Giacenze";
    if (loc.pathname.startsWith("/mep")) return "MEP";
    if (loc.pathname.startsWith("/orders")) return "Spesa";
    if (loc.pathname.startsWith("/members")) return "Team";
    if (loc.pathname.startsWith("/kitchen")) return "Kitchen";
    return "Dashboard";
  })();

  return (
    <div className="sticky top-0 z-30 border-b" style={{ background: "rgba(250,250,248,.92)", borderColor: "var(--border)", backdropFilter: "blur(10px)" }}>
      <div className="container flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="h2">{title}</div>
          <div className="p-muted text-xs truncate">{kitchen ? kitchen.name : "Seleziona una kitchen"}</div>
        </div>

        <div className="flex items-center gap-2">
          <Link className="btn btn-ghost px-3 py-2 text-xs" to="/kitchen">Kitchen</Link>
          <Link className="btn btn-gold px-3 py-2 text-xs" to="/orders">Export</Link>
        </div>
      </div>
    </div>
  );
}
