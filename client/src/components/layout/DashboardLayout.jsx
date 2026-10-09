import Navbar from "./Navbar";

function DashboardLayout({ children }) {
  return (
    <div className="site-background min-h-screen text-white">
      <Navbar />

      <main className="min-w-0 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
