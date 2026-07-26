function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;