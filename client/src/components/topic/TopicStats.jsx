function TopicStats({ questions }) {
  const easy = questions.filter(
    (q) => q.difficulty === "Easy"
  ).length;

  const medium = questions.filter(
    (q) => q.difficulty === "Medium"
  ).length;

  const hard = questions.filter(
    (q) => q.difficulty === "Hard"
  ).length;

  return (
    <div className="grid gap-5 md:grid-cols-4">

      <div className="rounded-xl bg-slate-900 p-6 border border-slate-700">

        <h2 className="text-slate-400">
          Total Questions
        </h2>

        <p className="mt-3 text-4xl font-bold">
          {questions.length}
        </p>

      </div>

      <div className="rounded-xl bg-green-900/20 border border-green-700 p-6">

        <h2 className="text-green-300">
          Easy
        </h2>

        <p className="mt-3 text-4xl font-bold">
          {easy}
        </p>

      </div>

      <div className="rounded-xl bg-yellow-900/20 border border-yellow-700 p-6">

        <h2 className="text-yellow-300">
          Medium
        </h2>

        <p className="mt-3 text-4xl font-bold">
          {medium}
        </p>

      </div>

      <div className="rounded-xl bg-red-900/20 border border-red-700 p-6">

        <h2 className="text-red-300">
          Hard
        </h2>

        <p className="mt-3 text-4xl font-bold">
          {hard}
        </p>

      </div>

    </div>
  );
}

export default TopicStats;