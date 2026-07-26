import Navbar from "./Navbar";
import UserSidebar from "./UserSidebar";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="flex">
        <UserSidebar />

        <main className="min-w-0 flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
