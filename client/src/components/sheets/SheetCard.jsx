import { Link } from "react-router-dom";

function SheetCard({ sheet }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-2 hover:border-cyan-500">

      {/* Title */}
      <h2 className="text-2xl font-bold text-white">
        📋 {sheet.name}
      </h2>

      {/* Author */}
      {sheet.author && (
        <p className="mt-2 text-sm text-slate-400">
          Author: {sheet.author}
        </p>
      )}

      {/* Description */}
      {sheet.description && (
        <p className="mt-4 text-sm text-slate-400 line-clamp-3">
          {sheet.description}
        </p>
      )}

      {/* Stats */}
      <div className="mt-5 flex items-center justify-between text-sm text-slate-300">
        <span>
          🔥 {sheet.totalQuestions || 0} Questions
        </span>
      </div>

      {/* Button */}
      <Link
        to={`/sheets/${sheet.slug}`}
        className="mt-6 inline-block rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold hover:bg-cyan-700"
      >
        Open Sheet →
      </Link>

    </div>
  );
}

export default SheetCard;