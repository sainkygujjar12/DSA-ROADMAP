import DataTable from "./DataTable";
import CompanyIcon from "../ui/CompanyIcon";

function QuestionTable({
  questions,
  onEdit,
  onDelete,
}) {
  const columns = [
    {
      key: "title",
      label: "Title",
    },
    {
      key: "difficulty",
      label: "Difficulty",
      render: (question) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            question.difficulty === "Easy"
              ? "bg-green-600"
              : question.difficulty === "Medium"
              ? "bg-yellow-600"
              : "bg-red-600"
          }`}
        >
          {question.difficulty}
        </span>
      ),
    },
    {
      key: "topic",
      label: "Topic",
      render: (question) =>
        question.topic?.name || "-",
    },
    {
      key: "companies",
      label: "Companies",
      render: (question) =>
        question.companies?.length
          ? <div className="flex flex-wrap gap-2">
              {question.companies.map(company => (
                <span key={company._id || company.name} className="inline-flex items-center gap-1.5">
                  <CompanyIcon company={company} size="sm" />
                  {company.name}
                </span>
              ))}
            </div>
          : "-",
    },
    {
      key: "sheets",
      label: "Sheets",
      render: (question) =>
        question.sheets?.length
          ? question.sheets
              .map((sheet) => sheet.name)
              .join(", ")
          : "-",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={questions}
      renderActions={(question) => (
        <div className="flex justify-center gap-2">

          <button
            onClick={() => onEdit(question)}
            className="rounded-lg bg-cyan-600 px-3 py-1 text-sm hover:bg-cyan-700"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(question)}
            className="rounded-lg bg-red-600 px-3 py-1 text-sm hover:bg-red-700"
          >
            Delete
          </button>

        </div>
      )}
    />
  );
}

export default QuestionTable;
