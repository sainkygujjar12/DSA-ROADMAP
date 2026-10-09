import { Link } from "react-router-dom";
import Card from "../ui/Card";

function RecentActivity({ recentSolved = [] }) {
  return (
    <Card className="border border-zinc-200 bg-white">

      <h2 className="mb-6 text-xl font-bold text-zinc-900">
        🕒 Recently Solved
      </h2>

      {recentSolved.length === 0 ? (
        <div className="rounded-lg bg-zinc-50 p-6 text-center text-zinc-500 border border-zinc-100">
          No solved questions yet.
        </div>
      ) : (
        <div className="space-y-3">

          {recentSolved.map((question) => (
            <Link
              key={question._id}
              to={`/questions/${question.slug}`}
              className="block rounded-lg bg-white border border-zinc-100 p-4 transition hover:bg-zinc-50 hover:border-zinc-300"
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">
                  <span className="text-emerald-500">✅</span>
                  <h3 className="font-medium text-zinc-900">
                    {question.title}
                  </h3>
                </div>

                <span
                  className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    question.difficulty === "Easy"
                      ? "bg-emerald-100 text-emerald-700"
                      : question.difficulty === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-rose-100 text-rose-700"
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