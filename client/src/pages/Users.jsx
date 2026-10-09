import { useEffect, useMemo, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import UserTable from "../../components/admin/UserTable";
import DeleteModal from "../../components/admin/DeleteModal";
import SearchBar from "../../components/admin/SearchBar";

import {
  getUsers,
  deleteUser,
} from "../../services/adminUserService";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [deleteUserData, setDeleteUserData] =
    useState(null);



  const fetchUsers = async () => {
    try {
      const response = await getUsers();

      setUsers(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getUsers().then(response => { if (active) setUsers(response.data || []); })
      .catch(error => console.error(error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleDelete = async () => {
    try {
      await deleteUser(deleteUserData._id);

      setDeleteUserData(null);

      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        user.email
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold">
            👥 Users
          </h1>

          <p className="mt-2 text-slate-400">
            Manage registered users.
          </p>
        </div>

      </div>

      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search users..."
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          Loading Users...
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onDelete={(user) =>
            setDeleteUserData(user)
          }
        />
      )}

      {deleteUserData && (
        <DeleteModal
          title={deleteUserData.name}
          onCancel={() =>
            setDeleteUserData(null)
          }
          onDelete={handleDelete}
        />
      )}
    </AdminLayout>
  );
}

export default Users;