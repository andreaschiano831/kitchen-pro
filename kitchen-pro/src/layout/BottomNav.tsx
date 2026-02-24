import { NavLink } from "react-router-dom";

const item = "px-4 py-3 text-sm font-semibold";
const active = "text-white";
const inactive = "text-neutral-300";

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{ background: "rgba(17,17,17,.92)", borderColor: "rgba(255,255,255,.08)", backdropFilter: "blur(12px)" }}>
      <div className="container flex justify-between">
        <NavLink to="/" className={({isActive}) => `${item} ${isActive?active:inactive}`}>Home</NavLink>
        <NavLink to="/inventory" className={({isActive}) => `${item} ${isActive?active:inactive}`}>Giacenze</NavLink>
        <NavLink to="/mep" className={({isActive}) => `${item} ${isActive?active:inactive}`}>MEP</NavLink>
        <NavLink to="/orders" className={({isActive}) => `${item} ${isActive?active:inactive}`}>Spesa</NavLink>
        <NavLink to="/members" className={({isActive}) => `${item} ${isActive?active:inactive}`}>Team</NavLink>
      </div>
    </div>
  );
}
