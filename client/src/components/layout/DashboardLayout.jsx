import Navbar from "./Navbar";
import Footer from "./Footer";

function DashboardLayout({ children }) {
  return (
    <div className="site-background flex min-h-screen flex-col text-white">
      <Navbar />

      <main className="app-content mx-auto w-full max-w-[1320px] min-w-0 flex-1 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default DashboardLayout;
