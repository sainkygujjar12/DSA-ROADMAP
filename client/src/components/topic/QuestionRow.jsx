import QuestionLink from "../ui/QuestionLink";
import { FaFileAlt, FaPen } from "react-icons/fa";
import DifficultyText from "../ui/DifficultyText";
import CompanyIcon from "../ui/CompanyIcon";

function QuestionRow({
  question,
  onToggleSolved,
  onToggleBookmark,
  onOpenNotes,
  showNotes = false,
  isSolving,
  isBookmarking
}) {
  const solved = question.solved || false;
  const bookmarked = question.bookmarked || false;
  const canToggleSolved = typeof onToggleSolved === "function";
  const canToggleBookmark = typeof onToggleBookmark === "function";
  const canOpenNotes = typeof onOpenNotes === "function";
  const hasNote = Boolean(question.note?.trim());

  return (
    <tr className="question-table-row">
      {/* Solved Checkbox */}
      <td className="px-4 py-4 w-12">
        <button
          type="button"
          onClick={() => onToggleSolved?.(question._id)}
          disabled={!canToggleSolved || isSolving}
          aria-pressed={solved}
          aria-label={solved ? "Mark as unsolved" : "Mark as solved"}
          className={`question-solve-control flex h-5 w-5 items-center justify-center rounded border transition-all ${
            solved
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-white/20 bg-transparent text-transparent hover:border-white/40"
          }`}
        >
          {isSolving ? (
            <span className="text-[10px] animate-spin">⏳</span>
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
      <td className="px-4 py-4 w-12 text-center">
        <button
          type="button"
          onClick={() => onToggleBookmark?.(question._id)}
          disabled={!canToggleBookmark || isBookmarking}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          className={`question-bookmark-control text-lg transition-colors ${
            bookmarked
              ? "text-yellow-500"
              : "text-zinc-300 hover:text-zinc-500"
          }`}
        >
          {bookmarked ? "★" : "☆"}
        </button>
      </td>

      {showNotes && (
        <td className="px-4 py-4 text-center">
          <button
            type="button"
            onClick={() => onOpenNotes?.(question)}
            disabled={!canOpenNotes}
            aria-label={hasNote ? "Edit note" : "Add note"}
            title={hasNote ? "Edit note" : "Add note"}
            className={`question-notes-button ${hasNote ? "has-note" : ""}`}
          >
            {hasNote ? <FaPen /> : <FaFileAlt />}
          </button>
        </td>
      )}

      {/* Question Title */}
      <td className="px-4 py-4">
        <QuestionLink
          to={`/questions/${question.slug}`}
          className={`question-list-title ${solved ? "is-solved" : ""}`}
        >
          {question.title}
        </QuestionLink>
        {question.isPremium && (
          <span className="ml-2 text-xs text-amber-400" title="Requires LeetCode Premium">LeetCode Premium</span>
        )}
      </td>

      {/* Difficulty */}
      <td className="px-4 py-4">
        <DifficultyText difficulty={question.difficulty} />
      </td>

      {/* Companies Logos */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 overflow-x-auto max-w-[200px] py-1">
          {question.companies && question.companies.length > 0 ? (
            question.companies.map((company, idx) => (
              <CompanyIcon key={idx} company={company} size="sm" />
            ))
          ) : (
            <span className="text-xs text-slate-500">No company data</span>
          )}
        </div>
      </td>
    </tr>
  );
}

export default QuestionRow;
