import Navbar from "./Navbar";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* GLOBAL NAV */}
      <Navbar />

      {/* PAGE CONTENT */}
      <div className="px-6 py-6">
        {children}
      </div>

    </div>
  );
}

export default MainLayout;