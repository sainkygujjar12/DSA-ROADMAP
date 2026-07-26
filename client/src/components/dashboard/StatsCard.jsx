import Card from "../ui/Card";

function StatsCard({
  title,
  value,
  icon,
  color = "text-cyan-500",
}) {
  return (
    <Card
      className="
        group
        border
        border-slate-800
        bg-slate-900
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-cyan-500
        hover:shadow-xl
        hover:shadow-cyan-500/10
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <h2 className="mt-3 text-5xl font-bold text-white">
            {value}
          </h2>
        </div>

        <div
          className={`text-5xl transition-transform duration-300 group-hover:scale-110 ${color}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default StatsCard;