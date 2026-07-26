function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "bg-cyan-600",
    green: "bg-green-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600",
    gray: "bg-slate-700",
  };

  return (
    <span
      className={`rounded-md px-3 py-1 text-sm text-white ${colors[color]}`}
    >
      {children}
    </span>
  );
}

export default Badge;