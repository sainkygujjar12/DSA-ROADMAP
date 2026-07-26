import UserSidebar from "./UserSidebar";

function UserLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">

      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>

    </div>
  );
}

export default UserLayout;