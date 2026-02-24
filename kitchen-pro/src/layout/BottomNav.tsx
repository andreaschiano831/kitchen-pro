import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-item ${isActive ? "nav-item-active" : ""}`;

export default function BottomNav() {
  return (
    <nav className="bottombar">
      <div className="container-pro">
        <div className="grid grid-cols-5 py-1">
          <NavLink to="/today" className={linkClass}>Today</NavLink>
          <NavLink to="/freezer" className={linkClass}>Freezer</NavLink>
          <NavLink to="/orders" className={linkClass}>Orders</NavLink>
          <NavLink to="/mep" className={linkClass}>MEP</NavLink>
          <NavLink to="/members" className={linkClass}>Team</NavLink>
        </div>
      </div>
    </nav>
  );
}
