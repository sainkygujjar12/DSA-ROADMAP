import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  toggleQuestionSolved,
  toggleBookmark,
} from "../../services/progressService";

const DIFFICULTY_STYLES = {
  Easy: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  Hard: "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20",
};

function QuestionRow({ question }) {
  const [solved, setSolved] = useState(question.solved || false);
  const [bookmarked, setBookmarked] = useState(
    question.bookmarked || false
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSolved(question.solved || false);
    setBookmarked(question.bookmarked || false);
  }, [question]);

  const handleSolved = async () => {
    try {
      setLoading(true);

      await toggleQuestionSolved(question._id);

      setSolved((prev) => !prev);
    } catch (error) {
      console.error(error);
      alert("Failed to update question status.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    try {
      await toggleBookmark(question._id);

      setBookmarked((prev) => !prev);
    } catch (error) {
      console.error(error);
      alert("Failed to update bookmark.");
    }
  };

  return (
    <tr className="group border-b border-slate-800/60 transition-colors hover:bg-slate-900/60">
      {/* Solved */}
      <td className="px-4 py-3.5">
        <button
          onClick={handleSolved}
          disabled={loading}
          aria-label={solved ? "Mark as unsolved" : "Mark as solved"}
          className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${
            solved
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
              : "border-slate-700 text-transparent hover:border-slate-500"
          }`}
        >
          {loading ? (
            <span className="text-xs">⏳</span>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className={`h-3.5 w-3.5 ${
                solved ? "opacity-100" : "opacity-0"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
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
      <td className="px-4 py-3.5">
        <button
          onClick={handleBookmark}
          aria-label={
            bookmarked ? "Remove bookmark" : "Add bookmark"
          }
          className={`text-lg transition ${
            bookmarked
              ? "text-yellow-400"
              : "text-slate-700 hover:text-slate-500"
          }`}
        >
          {bookmarked ? "★" : "☆"}
        </button>
      </td>

      {/* Question */}
      <td className="px-4 py-3.5">
        <Link
          to={`/questions/${question.slug}`}
          className="font-medium text-slate-200 transition group-hover:text-cyan-400"
        >
          {question.title}
        </Link>
      </td>

      {/* Difficulty */}
      <td className="px-4 py-3.5">
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            DIFFICULTY_STYLES[question.difficulty] ||
            "bg-slate-700/40 text-slate-300"
          }`}
        >
          {question.difficulty}
        </span>
      </td>

      {/* Companies */}
      <td className="px-4 py-3.5 text-sm text-slate-500">
        {question.companies?.length || 0}
      </td>

      {/* Solve */}
      <td className="px-4 py-3.5">
        <Link
          to={`/questions/${question.slug}`}
          className="text-sm font-medium text-cyan-500 opacity-80 transition hover:text-cyan-400 hover:opacity-100"
        >
          Solve →
        </Link>
      </td>
    </tr>
  );
}

export default QuestionRow;
