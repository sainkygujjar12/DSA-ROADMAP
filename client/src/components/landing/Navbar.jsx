import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaCode, FaUserCircle } from "react-icons/fa";
import { HiMenuAlt3 } from "react-icons/hi";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const navItems = [
    {
      name: "Roadmap",
      path: "/roadmap",
    },
    {
      name: "Companies",
      path: "/companies",
    },
    {
      name: "Sheets",
      path: "/sheets",
    },
    {
      name: "Dashboard",
      path: "/dashboard",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 shadow-lg">
            <FaCode className="text-xl text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              DSA Roadmap
            </h1>

            <p className="text-xs text-slate-400">
              Learn • Practice • Crack
            </p>
          </div>
        </Link>

        {/* Desktop */}

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `transition ${
                  isActive
                    ? "font-semibold text-cyan-500"
                    : "text-slate-300 hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Right */}

        <div className="hidden items-center gap-4 md:flex">

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-slate-300 transition hover:border-cyan-500 hover:text-white"
              >
                <FaUserCircle className="text-lg" />
                {user?.name?.split(" ")[0] || "Profile"}
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-2 font-semibold shadow-lg transition hover:scale-105"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-slate-700 px-5 py-2 text-slate-300 transition hover:border-cyan-500 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-2 font-semibold shadow-lg transition hover:scale-105"
              >
                Get Started
              </Link>
            </>
          )}

        </div>

        {/* Mobile */}

        <button
          onClick={() => setOpen(!open)}
          className="text-3xl text-white md:hidden"
        >
          <HiMenuAlt3 />
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-slate-800 bg-slate-900 p-6 md:hidden">

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className="block text-slate-300 hover:text-white"
            >
              {item.name}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block text-slate-300"
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="block w-full rounded-lg bg-cyan-600 px-4 py-2 text-center"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block text-slate-300"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-cyan-600 px-4 py-2 text-center"
              >
                Get Started
              </Link>
            </>
          )}

        </div>
      )}
    </header>
  );
}

export default Navbar;