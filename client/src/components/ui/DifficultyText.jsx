function DifficultyText({ difficulty }) {
  const colors = {
    Easy: "text-emerald-400",
    Medium: "text-amber-400",
    Hard: "text-rose-400",
  };

  return (
    <span className={`text-sm font-semibold ${colors[difficulty] || "text-slate-500"}`}>
      {difficulty}
    </span>
  );
}

export default DifficultyText;
