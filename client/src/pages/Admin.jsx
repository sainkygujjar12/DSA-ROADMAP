import AdminLayout from "../components/admin/AdminLayout";

function Admin() {
  return (
    <AdminLayout>

      <h1 className="text-4xl font-bold">
        👑 Admin Dashboard
      </h1>

      <p className="mt-3 text-slate-400">
        Welcome back Admin.
      </p>

    </AdminLayout>
  );
}

export default Admin;