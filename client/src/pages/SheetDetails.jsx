import usePracticeList from "../hooks/usePracticeList";
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaBookOpen, FaChartLine, FaTimes } from "react-icons/fa";

import MainLayout from "../components/layout/MainLayout";
import SheetQuestionList from "../components/sheets/SheetQuestionList";
import Pagination from "../components/ui/Pagination";
import SearchBar from "../components/topic/SearchBar";
import FilterDropdown from "../components/ui/FilterDropdown";
import { getSheetBySlug } from "../services/sheetService";
import {
  deleteNote,
  getProgress,
  saveNotes,
  toggleBookmark,
  toggleQuestionSolved,
} from "../services/progressService";
import { useAuth } from "../context/AuthContext";
import "./sheets.css";

function SheetDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [sheet, setSheet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { search, difficulty, pattern, section, page, setField } = usePracticeList(!loading);
  const setSearch = value => setField("search", value);
  const setDifficulty = value => setField("difficulty", value);
  const setPattern = value => setField("pattern", value);
  const setSection = value => setField("section", value);
  const setPage = value => setField("page", value);

  const [solvingId, setSolvingId] = useState(null);
  const [bookmarkingId, setBookmarkingId] = useState(null);
  const [noteQuestion, setNoteQuestion] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSheet() {
      setLoading(true);
      try {
        const [res, progressResponse] = await Promise.all([
          getSheetBySlug(slug),
          isAuthenticated ? getProgress().catch(() => null) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setSheet(res.data.sheet);

        const noteByQuestionId = new Map(
          (progressResponse?.data?.notes || []).map((item) => [
            (item.question?._id || item.question)?.toString(),
            item.content || "",
          ])
        );
        setQuestions(
          res.data.questions.map((question) => ({
            ...question,
            note: noteByQuestionId.get(question._id.toString()) || "",
          }))
        );
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setSheet(null);
          setQuestions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSheet();
    return () => {
      cancelled = true;
    };
  }, [slug, isAuthenticated]);

  // ================= PATTERN OPTIONS =================
  const patternOptions = useMemo(() => {
    const allTags = questions.flatMap((q) => q?.tags || []);
    return ["All", ...new Set(allTags)].sort((a, b) =>
      a === "All" ? -1 : a.localeCompare(b)
    );
  }, [questions]);

  // ================= FILTER LOGIC =================
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = q?.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesDifficulty =
        difficulty === "All" || q?.difficulty === difficulty;

      const matchesPattern =
        pattern === "All" || q?.tags?.includes(pattern);

      return (
        matchesSearch && matchesDifficulty && matchesPattern && (section === "All" || q.section === section)
      );
    });
  }, [questions, search, difficulty, pattern, section]);
  const sections = [...new Set(questions.map(question => question.section).filter(Boolean))];
  const levels = ["Easy", "Medium", "Hard", ...(questions.some(question => question.difficulty === "Unrated") ? ["Unrated"] : [])];
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / 40));
  const currentPage = Math.min(page, totalPages);
  const visibleQuestions = filteredQuestions.slice((currentPage - 1) * 40, currentPage * 40);

  const sheetStats = useMemo(() => {
    const difficulties = ["Easy", "Medium", "Hard", "Unrated"].map((level) => {
      const matching = questions.filter((question) => question.difficulty === level);
      return {
        level,
        total: matching.length,
        solved: matching.filter((question) => question.solved).length,
      };
    }).filter(item => item.total > 0);
    const total = questions.length;
    const solved = questions.filter((question) => question.solved).length;

    return {
      total,
      solved,
      progress: total ? Math.round((solved / total) * 100) : 0,
      difficulties,
    };
  }, [questions]);

  const handleToggleSolved = async (id) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setSolvingId(id);
    try {
      const response = await toggleQuestionSolved(id);
      const serverSolved = response?.data?.solvedQuestions?.some(
        (question) => (question?._id || question)?.toString() === id
      );
      setQuestions((current) => current.map((question) => (
        question._id === id
          ? { ...question, solved: typeof serverSolved === "boolean" ? serverSolved : !question.solved }
          : question
      )));
    } catch (error) {
      console.error("Sheet solved status error:", error);
      alert(error.response?.data?.message || "Failed to update solved status");
    } finally {
      setSolvingId(null);
    }
  };

  const handleToggleBookmark = async (id) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setBookmarkingId(id);
    try {
      const response = await toggleBookmark(id);
      const serverBookmarked = response?.data?.bookmarkedQuestions?.some(
        (question) => (question?._id || question)?.toString() === id
      );
      setQuestions((current) => current.map((question) => (
        question._id === id
          ? { ...question, bookmarked: typeof serverBookmarked === "boolean" ? serverBookmarked : !question.bookmarked }
          : question
      )));
    } catch (error) {
      console.error("Sheet bookmark error:", error);
      alert(error.response?.data?.message || "Failed to update bookmark");
    } finally {
      setBookmarkingId(null);
    }
  };

  const handleOpenNotes = (question) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setNoteQuestion(question);
    setNoteContent(question.note || "");
    setNoteError("");
  };

  const closeNotes = ({ force = false } = {}) => {
    if (savingNote && !force) return;
    setNoteQuestion(null);
    setNoteContent("");
    setNoteError("");
  };

  const handleSaveNote = async (event) => {
    event.preventDefault();
    if (!noteQuestion?._id) return;

    const content = noteContent.trim();
    if (!content && !noteQuestion.note?.trim()) {
      closeNotes({ force: true });
      return;
    }

    try {
      setSavingNote(true);
      if (content) {
        await saveNotes(noteQuestion._id, content);
      } else {
        await deleteNote(noteQuestion._id);
      }

      setQuestions((current) => current.map((question) => (
        question._id === noteQuestion._id
          ? { ...question, note: content }
          : question
      )));
      closeNotes({ force: true });
    } catch (error) {
      console.error("Sheet note error:", error);
      setNoteError(error.response?.data?.message || "Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-white">
          Loading...
        </div>
      </MainLayout>
    );
  }
  if (!sheet) return <MainLayout><div className="sheet-list-empty" role="alert"><h1>Sheet unavailable</h1><p>Please try again or choose another collection.</p><Link to="/sheets">Back to practice sheets</Link></div></MainLayout>;

  return (
    <MainLayout>
      <div className="sheet-detail-page">
        <div className="sheet-detail-breadcrumb"><Link to="/sheets"><FaArrowLeft /> Sheets</Link> / <strong>{sheet?.name}</strong></div>
        <div className="sheet-detail-layout">
          <main className="sheet-detail-main">
            <section className="sheet-detail-hero">
              <div>
                <p className="eyebrow-label">Problem collection</p>
                <h1><FaBookOpen /> {sheet?.name}</h1>
                <p>{sheet?.description || "A focused set of problems for structured interview preparation."}</p>
                <span className="sheet-detail-author">{sheet?.author || "Curated by DSA Roadmap"}</span>
              </div>
              <div className="sheet-detail-count"><strong>{questions.length}</strong><span>questions</span></div>
            </section>
            {sheet.sourceUrl && <details className="sheet-source-note"><summary>About this collection · {sections.length} sections</summary><p>{sheet.sourceNote}</p><div><a href={sheet.sourceUrl} target="_blank" rel="noopener noreferrer">Original sheet ↗</a>{sheet.archiveUrl && <a href={sheet.archiveUrl} target="_blank" rel="noopener noreferrer">Classic edition archive ↗</a>}</div><p>Repeated entries share solved status. Unrated means the source does not supply a difficulty.</p></details>}

            <div className="sheet-detail-toolbar">
              <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="sheet-detail-filters">
                <FilterDropdown label="Difficulty" options={["All", ...levels]} value={difficulty} onChange={setDifficulty} />
                {sections.length > 0 ? <FilterDropdown label="Section" options={["All", ...sections]} value={section} onChange={setSection} /> : <FilterDropdown label="Pattern" options={patternOptions} value={pattern} onChange={setPattern} />}
              </div>
            </div>

            <p className="sheet-result-count" role="status">{filteredQuestions.length ? `${(currentPage - 1) * 40 + 1}–${Math.min(currentPage * 40, filteredQuestions.length)} of ${filteredQuestions.length}` : "0"} questions{questions.some(question => question.sourceOrder) ? " · Original sheet order" : ""}</p>
            <SheetQuestionList
              questions={visibleQuestions}
              onToggleSolved={handleToggleSolved}
              onToggleBookmark={handleToggleBookmark}
              onOpenNotes={handleOpenNotes}
              showNotes
              solvingId={solvingId}
              bookmarkingId={bookmarkingId}
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </main>

          <SheetProgressCard stats={sheetStats} name={sheet?.name} />
        </div>
      </div>

      {noteQuestion && (
        <div className="sheet-note-backdrop" onClick={closeNotes}>
          <form
            className="sheet-note-dialog"
            onSubmit={handleSaveNote}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-note-dialog-heading">
              <div>
                <p className="eyebrow-label">Private note</p>
                <h2>{noteQuestion.title}</h2>
              </div>
              <button type="button" onClick={closeNotes} aria-label="Close notes">
                <FaTimes />
              </button>
            </div>
            <textarea
              value={noteContent}
              onChange={(event) => setNoteContent(event.target.value)}
              placeholder="Write your approach, edge cases, or mistakes..."
              autoFocus
              rows={8}
            />
            {noteError && <p className="sheet-note-error">{noteError}</p>}
            <div className="sheet-note-dialog-actions">
              <button type="button" onClick={closeNotes} disabled={savingNote} className="sheet-note-cancel">
                Cancel
              </button>
              <button type="submit" disabled={savingNote} className="sheet-note-save">
                {savingNote ? "Saving..." : "Save note"}
              </button>
            </div>
          </form>
        </div>
      )}
    </MainLayout>
  );
}

function SheetProgressCard({ stats, name }) {
  const angle = `${Math.max(0, Math.min(100, stats.progress)) * 3.6}deg`;

  return (
    <aside className="sheet-progress-card">
      <div className="sheet-progress-heading">
        <FaChartLine />
        <span>{name || "Sheet"}</span>
      </div>
      <div className="sheet-progress-ring" style={{ background: `conic-gradient(var(--app-accent) ${angle}, var(--app-border) ${angle} 360deg)` }}>
        <div>
          <strong>{stats.solved}</strong>
          <span>/{stats.total}</span>
          <small>Solved</small>
        </div>
      </div>
      <div className="sheet-progress-difficulty">
        {stats.difficulties.map((item) => (
          <div key={item.level}>
            <strong className={item.level.toLowerCase()}>{item.level}</strong>
            <span>{item.solved}/{item.total}</span>
          </div>
        ))}
      </div>
      <div className="sheet-progress-bar"><span style={{ width: `${stats.progress}%` }} /></div>
      <p>{stats.progress}% of this sheet complete</p>
    </aside>
  );
}

export default SheetDetails;
