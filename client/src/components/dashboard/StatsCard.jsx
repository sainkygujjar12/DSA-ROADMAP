import Card from "../ui/Card";

function StatsCard({
  title,
  value,
  icon,
  color = "text-zinc-900",
}) {
  return (
    <Card
      className="
        group
        border
        border-zinc-200
        bg-white
        transition-all
        duration-300
        hover:border-zinc-400
        hover:shadow-sm
      "
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {title}
          </p>

          <h2 className="text-4xl font-bold text-zinc-900">
            {value}
          </h2>
        </div>

        <div
          className={`text-3xl transition-transform duration-300 group-hover:scale-110 ${color}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default StatsCard;