function ProgressBar({ value = 0 }) {
  return (
    <div className="w-full h-3 rounded-full bg-slate-700 overflow-hidden">
      <div
        className="h-full bg-cyan-500 transition-all duration-500"
        style={{
          width: `${value}%`,
        }}
      />
    </div>
  );
}

export default ProgressBar;