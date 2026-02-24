import { NavLink } from "react-router-dom";

const base = "flex flex-col items-center justify-center gap-1 py-2 text-xs";
const active = "text-white";
const inactive = "text-neutral-400";

function Item({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
    >
      <span>{label}</span>
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4">
        <Item to="/today" label="Today" />
        <Item to="/freezer" label="Freezer" />
        <Item to="/orders" label="Orders" />
        <Item to="/mep" label="MEP" />
      </div>
    </nav>
  );
}
