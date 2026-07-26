function DifficultyFilter({ value, onChange }) {
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {difficulties.map((difficulty) => (
        <button
          key={difficulty}
          onClick={() => onChange(difficulty)}
          className={`rounded-lg px-4 py-2 transition ${
            value === difficulty
              ? "bg-cyan-600 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {difficulty}
        </button>
      ))}
    </div>
  );
}

export default DifficultyFilter;