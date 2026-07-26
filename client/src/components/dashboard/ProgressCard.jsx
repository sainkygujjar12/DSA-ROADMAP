function ProgressCard({
  solved,
  total,
  percentage,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <div className="flex items-center justify-between">

        <h2 className="text-2xl font-bold">
          Overall Progress
        </h2>

        <span className="text-cyan-400 font-bold">
          {percentage}%
        </span>

      </div>

      <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-700">

        <div
          className="h-full rounded-full bg-cyan-500 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

      <p className="mt-4 text-slate-400">
        {solved} / {total} Questions Solved
      </p>

    </div>
  );
}

export default ProgressCard;