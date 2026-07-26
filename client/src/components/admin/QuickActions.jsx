import { Link } from "react-router-dom";

const actions = [
  {
    title: "Add Question",
    path: "/admin/questions",
  },
  {
    title: "Add Topic",
    path: "/admin/topics",
  },
  {
    title: "Add Company",
    path: "/admin/companies",
  },
  {
    title: "Add Sheet",
    path: "/admin/sheets",
  },
];

function QuickActions() {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
      <h2 className="mb-5 text-2xl font-bold">
        ⚡ Quick Actions
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.title}
            to={action.path}
            className="rounded-lg bg-cyan-600 p-4 text-center transition hover:bg-cyan-700"
          >
            {action.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;