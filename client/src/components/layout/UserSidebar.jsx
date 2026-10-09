import { Link, useLocation } from "react-router-dom";

function UserSidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Roadmap", path: "/roadmap", icon: "📍" },
    { name: "Companies", path: "/companies", icon: "🏢" },
    { name: "Sheets", path: "/sheets", icon: "📋" },
    { name: "Bookmarks", path: "/bookmarks", icon: "🔖" },
    { name: "Notes", path: "/notes", icon: "📝" },
    { name: "Profile", path: "/profile", icon: "👤" },
  ];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-black/10 p-4 lg:block">

      <h1 className="mb-6 text-xl font-bold text-white">
        DSA Roadmap
      </h1>

      <nav className="space-y-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              location.pathname === item.path
                ? "bg-[#665cff] text-white shadow-lg shadow-indigo-950/30"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

    </aside>
  );
}

export default UserSidebar;
