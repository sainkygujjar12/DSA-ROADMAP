import { NavLink } from "react-router-dom";

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
          isActive
            ? "bg-cyan-600 text-white"
            : "text-slate-300 hover:bg-slate-800"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default NavItem;