import SheetCard from "./SheetCard";

function SheetGrid({ sheets }) {
  if (!sheets.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
        No sheets found.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sheets.map((sheet) => (
        <SheetCard key={sheet._id} sheet={sheet} />
      ))}
    </div>
  );
}

export default SheetGrid;