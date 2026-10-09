function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "bg-zinc-100 text-zinc-700 border border-zinc-300",
    green: "bg-zinc-100 text-zinc-700 border border-zinc-300",
    red: "bg-zinc-100 text-zinc-700 border border-zinc-300",
    yellow: "bg-zinc-100 text-zinc-700 border border-zinc-300",
    gray: "bg-zinc-200 text-zinc-600 border border-zinc-300",
  };

  return (
    <span
      className={`rounded-sm px-2 py-0.5 text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

export default Badge;