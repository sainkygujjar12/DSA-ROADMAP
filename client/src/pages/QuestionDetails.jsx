import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/ui/Loader";
import NotesSection from "../components/question/NotesSection";

import { getQuestionBySlug } from "../services/questionService";
import {
  getProgress,
  toggleQuestionSolved,
  toggleBookmark,
  updateLastVisited,
} from "../services/progressService";

function QuestionDetails() {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [solved, setSolved] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [questionResponse, progressResponse] =
          await Promise.all([
            getQuestionBySlug(slug),
            getProgress(),
          ]);

        const questionData =
          questionResponse?.data || null;

        setQuestion(questionData);

        if (!questionData?._id) return;

        // Update last visited
        await updateLastVisited(questionData._id);

        // Safe progress data
        const solvedQuestions =
          progressResponse?.data?.solvedQuestions || [];

        const solvedIds = solvedQuestions.map(
          (q) => q?._id
        );

        setSolved(
          solvedIds.includes(questionData._id)
        );

        // Safe bookmarks
        const bookmarkedQuestions =
          progressResponse?.data?.bookmarkedQuestions || [];

        const bookmarkedIds = bookmarkedQuestions.map(
          (q) => q?._id
        );

        setBookmarked(
          bookmarkedIds.includes(questionData._id)
        );

        // Safe notes
        const existingNote =
          progressResponse?.data?.notes?.find(
            (n) =>
              n?.question?._id === questionData._id
          );

        setNote(existingNote?.content || "");
      } catch (error) {
        console.error("QuestionDetails error:", error);
        setQuestion(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  // ================= TOGGLE SOLVED =================
  const handleSolved = async () => {
    try {
      if (!question?._id) return;

      setSaving(true);

      await toggleQuestionSolved(question._id);

      setSolved((prev) => !prev);
    } catch (error) {
      console.error(error);
      alert("Failed to update question status.");
    } finally {
      setSaving(false);
    }
  };

  // ================= TOGGLE BOOKMARK =================
  const handleBookmark = async () => {
    try {
      if (!question?._id) return;

      setBookmarking(true);

      await toggleBookmark(question._id);

      setBookmarked((prev) => !prev);
    } catch (error) {
      console.error(error);
      alert("Failed to update bookmark.");
    } finally {
      setBookmarking(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  // ================= NOT FOUND =================
  if (!question) {
    return (
      <MainLayout>
        <h2 className="text-center text-2xl">
          Question not found
        </h2>
      </MainLayout>
    );
  }

  return (
    <MainLayout>

      {/* Back */}
      <Link
        to={`/roadmap/${question?.topic?.slug}`}
        className="text-cyan-500 hover:underline"
      >
        ← Back to {question?.topic?.name}
      </Link>

      {/* Title */}
      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-4xl font-bold">
          {question?.title}
        </h1>

        {/* Difficulty */}
        <div className="mt-4 flex gap-3">
          <span
            className={`rounded px-3 py-1 text-sm ${
              question?.difficulty === "Easy"
                ? "bg-green-600"
                : question?.difficulty === "Medium"
                ? "bg-yellow-600"
                : "bg-red-600"
            }`}
          >
            {question?.difficulty}
          </span>
        </div>

        {/* Companies */}
        <div className="mt-8">
          <h3 className="mb-2 text-xl font-semibold">
            Companies
          </h3>

          <div className="flex flex-wrap gap-2">
            {question?.companies?.length ? (
              question.companies.map((company) => (
                <span
                  key={company?._id}
                  className="rounded bg-slate-800 px-3 py-2"
                >
                  {company?.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No companies tagged
              </p>
            )}
          </div>
        </div>

        {/* Sheets */}
        <div className="mt-8">
          <h3 className="mb-2 text-xl font-semibold">
            Sheets
          </h3>

          <div className="flex flex-wrap gap-2">
            {question?.sheets?.length ? (
              question.sheets.map((sheet) => (
                <span
                  key={sheet?._id}
                  className="rounded bg-slate-800 px-3 py-2"
                >
                  {sheet?.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No sheets linked
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap gap-4">

          {question?.leetcodeUrl && (
            <a
              href={question.leetcodeUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-green-600 px-6 py-3 hover:bg-green-700"
            >
              Solve on LeetCode
            </a>
          )}

          {question?.gfgUrl && (
            <a
              href={question.gfgUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-emerald-800 px-6 py-3 hover:bg-emerald-700"
            >
              Solve on GeeksforGeeks
            </a>
          )}

          <button
            onClick={handleSolved}
            disabled={saving}
            className={`rounded-lg px-6 py-3 transition ${
              solved
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-cyan-600 hover:bg-cyan-700"
            }`}
          >
            {saving
              ? "Saving..."
              : solved
              ? "✅ Solved"
              : "Mark as Solved"}
          </button>

          <button
            onClick={handleBookmark}
            disabled={bookmarking}
            className={`rounded-lg px-6 py-3 transition ${
              bookmarked
                ? "bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
          </button>

          {question?.youtubeUrl && (
            <a
              href={question.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-red-600 px-6 py-3 hover:bg-red-700"
            >
              YouTube
            </a>
          )}

          {question?.articleUrl && (
            <a
              href={question.articleUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-sky-600 px-6 py-3 hover:bg-sky-700"
            >
              Article
            </a>
          )}
        </div>

        {/* Notes */}
        <NotesSection
          questionId={question?._id}
          initialNote={note}
        />
      </div>
    </MainLayout>
  );
}

export default QuestionDetails;