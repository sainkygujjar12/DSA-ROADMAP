function ProgressBar({ value = 0 }) {
  return (
    <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
      <div
        className="h-full bg-zinc-900 transition-all duration-500"
        style={{
          width: `${value}%`,
        }}
      />
    </div>
  );
}

export default ProgressBar;