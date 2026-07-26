function StatsCard({
  title,
  value,
  icon,
  color = "bg-cyan-600",
}) {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">

      <div className="flex justify-between">

        <div>

          <p className="text-slate-400">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {value}
          </h2>

        </div>

        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${color}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

export default StatsCard;