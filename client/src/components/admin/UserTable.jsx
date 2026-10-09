import DataTable from "./DataTable";

function UserTable({
  users,
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
            disabled={user.isOwner}
            title={user.isOwner ? "Owner account is protected" : "Delete user"}
            onClick={() =>
              onDelete(user)
            }
            className="rounded bg-red-600 px-3 py-1 text-sm hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Delete
          </button>

        </div>
      )}
    />
  );
}

export default UserTable;