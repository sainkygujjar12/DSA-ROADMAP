import DataTable from "./DataTable";

function UserTable({
  users,
  onRoleChange,
  onDelete,
}) {
  const columns = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "role",
      label: "Role",
      render: (user) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            user.role === "admin"
              ? "bg-teal-600"
              : "bg-cyan-600"
          }`}
        >
          {user.role}
        </span>
      ),
    },
    {
      key: "totalSolved",
      label: "Solved",
    },
    {
      key: "streak",
      label: "🔥 Streak",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      renderActions={(user) => (
        <div className="flex justify-center gap-2">

          <button
            onClick={() =>
              onRoleChange(user)
            }
            className="rounded bg-yellow-600 px-3 py-1 text-sm hover:bg-yellow-700"
          >
            {user.role === "admin"
              ? "Make User"
              : "Make Admin"}
          </button>

          <button
            onClick={() =>
              onDelete(user)
            }
            className="rounded bg-red-600 px-3 py-1 text-sm hover:bg-red-700"
          >
            Delete
          </button>

        </div>
      )}
    />
  );
}

export default UserTable;