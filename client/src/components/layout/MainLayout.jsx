import Navbar from "./Navbar";

function MainLayout({ children }) {
  return (
    <div className="site-background min-h-screen text-white">

      {/* GLOBAL NAV */}
      <Navbar />

      {/* PAGE CONTENT */}
      <div className="app-content mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>

    </div>
  );
}

export default MainLayout;
