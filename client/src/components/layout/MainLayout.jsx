import Navbar from "./Navbar";
import Footer from "./Footer";

function MainLayout({ children }) {
  return (
    <div className="site-background flex min-h-screen flex-col text-white">

      {/* GLOBAL NAV */}
      <Navbar />

      {/* PAGE CONTENT */}
      <div className="app-content mx-auto w-full max-w-[1320px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
      <Footer />
    </div>
  );
}

export default MainLayout;
