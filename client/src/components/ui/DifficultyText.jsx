function DifficultyText({ difficulty }) {
  const colors = {
    Easy: "text-emerald-400",
    Medium: "text-yellow-400",
    Hard: "text-rose-400",
  };

  return (
    <span className={`text-sm font-medium ${colors[difficulty] || "text-slate-400"}`}>
      {difficulty}
    </span>
  );
}

export default DifficultyText;
