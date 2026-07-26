import { Link, useLocation } from "react-router-dom";

function AdminSidebar() {
  const location = useLocation();

  const menu = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: "📊",
    },
    {
      name: "Questions",
      path: "/admin/questions",
      icon: "📚",
    },
    {
      name: "Topics",
      path: "/admin/topics",
      icon: "🧩",
    },
    {
      name: "Companies",
      path: "/admin/companies",
      icon: "🏢",
    },
    {
      name: "Sheets",
      path: "/admin/sheets",
      icon: "📋",
    },
    {
      name: "Bulk Import",
      path: "/admin/bulk-import",
      icon: "📥",
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: "👥",
    },

    // 👇 USER FEATURES (OK TO KEEP HERE IF YOU WANT CROSS NAV)
    {
      name: "Bookmarks",
      path: "/bookmarks",
      icon: "🔖",
    },
    {
      name: "Notes",
      path: "/notes",
      icon: "📝",
    },
    {
      name: "Profile",
      path: "/profile",
      icon: "👤",
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 p-4">
      <h2 className="text-xl font-bold mb-6 text-white">
        DSA Roadmap
      </h2>

      <nav className="space-y-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-2 rounded-lg transition ${
              location.pathname === item.path
                ? "bg-cyan-600 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;