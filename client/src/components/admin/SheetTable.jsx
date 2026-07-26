import DataTable from "./DataTable";

function SheetTable({
  sheets,
  onEdit,
  onDelete,
}) {
  const columns = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "author",
      label: "Author",
      render: (sheet) =>
        sheet.author || "-",
    },
    {
      key: "totalQuestions",
      label: "Questions",
    },
    {
      key: "isActive",
      label: "Status",
      render: (sheet) => (
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            sheet.isActive
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {sheet.isActive
            ? "Active"
            : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={sheets}
      renderActions={(sheet) => (
        <div className="flex justify-center gap-2">

          <button
            onClick={() => onEdit(sheet)}
            className="rounded-lg bg-cyan-600 px-3 py-1"
          >
            Edit
          </button>

          <button
            onClick={() =>
              onDelete(sheet)
            }
            className="rounded-lg bg-red-600 px-3 py-1"
          >
            Delete
          </button>

        </div>
      )}
    />
  );
}

export default SheetTable;