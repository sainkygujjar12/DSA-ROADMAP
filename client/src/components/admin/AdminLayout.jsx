import DashboardLayout from "../layout/DashboardLayout";
import AdminSidebar from "./AdminSidebar";

function AdminLayout({ children }) {
  return (
    <DashboardLayout>
      <div className="admin-workspace">
        <AdminSidebar />

        <main className="admin-content">
          {children}
        </main>
      </div>
    </DashboardLayout>
  );
}

export default AdminLayout;