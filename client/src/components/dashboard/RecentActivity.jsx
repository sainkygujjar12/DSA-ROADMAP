import { Link } from "react-router-dom";
import Card from "../ui/Card";

function RecentActivity({ recentSolved = [] }) {
  return (
    <Card className="border border-slate-800 bg-slate-900">

      <h2 className="mb-6 text-2xl font-bold">
        🕒 Recently Solved
      </h2>

      {recentSolved.length === 0 ? (
        <div className="rounded-lg bg-slate-800 p-6 text-center text-slate-400">
          No solved questions yet.
        </div>
      ) : (
        <div className="space-y-4">

          {recentSolved.map((question) => (
            <Link
              key={question._id}
              to={`/questions/${question.slug}`}
              className="block rounded-lg bg-slate-800 p-4 transition hover:bg-slate-700"
            >
              <div className="flex items-center justify-between">

                <div>
                  <h3 className="font-semibold">
                    ✅ {question.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {question.difficulty}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    question.difficulty === "Easy"
                      ? "bg-green-500/20 text-green-400"
                      : question.difficulty === "Medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {question.difficulty}
                </span>

              </div>
            </Link>
          ))}

        </div>
      )}

    </Card>
  );
}

export default RecentActivity;