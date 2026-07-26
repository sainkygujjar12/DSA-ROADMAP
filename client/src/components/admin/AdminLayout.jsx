import DashboardLayout from "../layout/DashboardLayout";
import AdminSidebar from "./AdminSidebar";

function AdminLayout({ children }) {
  return (
    <DashboardLayout>
      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </DashboardLayout>
  );
}

export default AdminLayout;