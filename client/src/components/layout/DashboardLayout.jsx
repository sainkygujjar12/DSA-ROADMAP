import Navbar from "./Navbar";

function DashboardLayout({ children }) {
  return (
    <div className="site-background min-h-screen text-white">
      <Navbar />

      <main className="app-content mx-auto w-full max-w-[1320px] min-w-0 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
