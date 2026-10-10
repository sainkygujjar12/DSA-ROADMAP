import TopicIcon from "../common/TopicIcon";
import DataTable from "./DataTable";

function TopicTable({
  topics,
  onEdit,
  onDelete,
}) {
  const columns = [
    {
      key: "icon",
      label: "Icon",
      render: (topic) => (
        <TopicIcon slug={topic.slug} size={22} />
      ),
    },
    {
      key: "name",
      label: "Name",
    },
    {
      key: "slug",
      label: "Slug",
      render: (topic) => (
        <span className="text-slate-400">
          {topic.slug}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={topics}
      renderActions={(topic) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onEdit(topic)}
            className="rounded-lg bg-cyan-600 px-3 py-1 text-sm hover:bg-cyan-700"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(topic)}
            className="rounded-lg bg-red-600 px-3 py-1 text-sm hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      )}
    />
  );
}

export default TopicTable;