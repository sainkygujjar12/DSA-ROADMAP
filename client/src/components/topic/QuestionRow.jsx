import { Link } from "react-router-dom";
import DifficultyText from "../ui/DifficultyText";

function QuestionRow({
  question,
  onToggleSolved,
  onToggleBookmark,
  isSolving,
  isBookmarking
}) {
  const solved = question.solved || false;
  const bookmarked = question.bookmarked || false;

  return (
    <tr className="group border-b border-slate-800/60 transition-colors hover:bg-slate-900/60">
      {/* Solved Checkbox */}
      <td className="px-4 py-3.5 w-12">
        <button
          onClick={() => onToggleSolved(question._id)}
          disabled={isSolving}
          aria-label={solved ? "Mark as unsolved" : "Mark as solved"}
          className={`flex h-5 w-5 items-center justify-center rounded border transition ${
            solved
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
              : "border-slate-700 text-transparent hover:border-slate-500"
          }`}
        >
          {isSolving ? (
            <span className="text-[10px]">⏳</span>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className={`h-3 w-3 ${solved ? "opacity-100" : "opacity-0"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
      </td>

      {/* Bookmark */}
      <td className="px-4 py-3.5 w-12 text-center">
        <button
          onClick={() => onToggleBookmark(question._id)}
          disabled={isBookmarking}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          className={`text-base transition ${
            bookmarked
              ? "text-yellow-400"
              : "text-slate-700 hover:text-slate-500"
          }`}
        >
          {bookmarked ? "★" : "☆"}
        </button>
      </td>

      {/* Question Title */}
      <td className="px-4 py-3.5">
        <Link
          to={`/questions/${question.slug}`}
          className={`font-medium transition group-hover:text-cyan-400 ${
            solved ? "text-slate-500 line-through" : "text-slate-200"
          }`}
        >
          {question.title}
        </Link>
      </td>

      {/* Difficulty */}
      <td className="px-4 py-3.5">
        <DifficultyText difficulty={question.difficulty} />
      </td>

      {/* Companies Count */}
      <td className="px-4 py-3.5 text-xs text-slate-500 text-center">
        {question.companies?.length || 0}
      </td>
    </tr>
  );
}

export default QuestionRow;
