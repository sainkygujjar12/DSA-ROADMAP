import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4 text-white">

      {/* Left */}
      <div className="flex items-center gap-3">

        <button
          onClick={() => navigate("/")}
          className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
        >
          🏠 Home
        </button>

        <button
          onClick={() => navigate(-1)}
          className="rounded bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
        >
          ← Back
        </button>

      </div>

      {/* Center */}
      <div className="text-sm text-slate-400">
        {location.pathname}
      </div>

      {/* Right */}
      <div className="text-sm text-slate-400">
        DSA Roadmap
      </div>

    </div>
  );
}

export default Navbar;