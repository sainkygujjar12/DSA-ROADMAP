import DataTable from "./DataTable";

function CompanyTable({
  companies,
  onEdit,
  onDelete,
}) {
  const columns = [
    {
      key: "logo",
      label: "Logo",
      render: (company) => (
        <img
          src={
            company.logo ||
            "https://placehold.co/40x40"
          }
          alt={company.name}
          className="h-10 w-10 rounded-full object-cover"
        />
      ),
    },
    {
      key: "name",
      label: "Company",
    },
    {
      key: "website",
      label: "Website",
      render: (company) =>
        company.website || "-",
    },
    {
      key: "totalQuestions",
      label: "Questions",
    },
    {
      key: "isActive",
      label: "Status",
      render: (company) => (
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            company.isActive
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {company.isActive
            ? "Active"
            : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={companies}
      renderActions={(company) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onEdit(company)}
            className="rounded-lg bg-cyan-600 px-3 py-1"
          >
            Edit
          </button>

          <button
            onClick={() =>
              onDelete(company)
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

export default CompanyTable;