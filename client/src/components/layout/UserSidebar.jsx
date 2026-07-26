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
    <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-4 lg:block">

      <h1 className="text-xl font-bold mb-6 text-white">
        DSA Roadmap
      </h1>

      <nav className="space-y-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              location.pathname === item.path
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
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