import {
  FaBook,
  FaBuilding,
  FaClipboardList,
  FaHome,
  FaStickyNote,
  FaUser,
  FaStar,
} from "react-icons/fa";

import Logo from "../common/Logo";
import NavItem from "../common/NavItem";

function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-900 p-6">

      <Logo />

      <nav className="mt-10 flex flex-col gap-3">

        <NavItem
          to="/dashboard"
          icon={<FaHome />}
          label="Dashboard"
        />

        <NavItem
          to="/roadmap"
          icon={<FaBook />}
          label="Roadmap"
        />

        <NavItem
          to="/bookmarks"
          icon={<FaStar />}
          label="Bookmarks"
        />

        <NavItem
          to="/companies"
          icon={<FaBuilding />}
          label="Companies"
        />

        <NavItem
          to="/sheets"
          icon={<FaClipboardList />}
          label="Sheets"
        />

        <NavItem
          to="/notes"
          icon={<FaStickyNote />}
          label="Notes"
        />

        <NavItem
          to="/profile"
          icon={<FaUser />}
          label="Profile"
        />

      </nav>
    </aside>
  );
}

export default Sidebar;