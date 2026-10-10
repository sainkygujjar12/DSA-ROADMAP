import usePracticeList from "../hooks/usePracticeList";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaBook,
} from "react-icons/fa";

import MainLayout from "../components/layout/MainLayout";
import QuestionTable from "../components/topic/QuestionTable";
import SearchBar from "../components/topic/SearchBar";
import FilterDropdown from "../components/ui/FilterDropdown";
import Pagination from "../components/ui/Pagination";
import { getTopicBySlug } from "../services/topicService";
import { toggleQuestionSolved, toggleBookmark } from "../services/progressService";
import { useAuth } from "../context/AuthContext";

function TopicDetails() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();

  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { search: searchInput, difficulty, pattern, page, setField } = usePracticeList(!loading);
  const setDifficulty = value => setField("difficulty", value);
  const setPattern = value => setField("pattern", value);
  const setPage = value => setField("page", value);

  const setSearchInput = value => setField("search", value);
  const [search, setSearch] = useState(searchInput.trim());

  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [topicStats, setTopicStats] = useState(null);
  const [limit] = useState(10);

  // Track which question is currently being updated to show loader in row
  const [solvingId, setSolvingId] = useState(null);
  const [bookmarkingId, setBookmarkingId] = useState(null);

  // Keep the input mounted while the server filters questions. Without a
  // debounce, each keystroke replaced the whole page with a loading state,
  // which removed focus from the input after the first character.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    async function loadTopic() {
      try {
        setLoading(true);
        const res = await getTopicBySlug(slug, {
          page,
          limit,
          difficulty,
          pattern,
          search,
        });
        if (cancelled) return;
        setTopic(res?.data?.topic || null);
        setQuestions(res?.data?.questions || []);
        setTotalPages(res?.data?.pagination?.pages || 1);
        setTotalQuestions(res?.data?.pagination?.total || 0);
        setTopicStats(res?.data?.stats || null);
      } catch (err) {
        if (cancelled) return;
        console.error("TopicDetails error:", err);
        setTopic(null);
        setQuestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTopic();
    return () => { cancelled = true; };
  }, [slug, page, difficulty, pattern, search, limit]);

  const handleToggleSolved = async (id) => {
    setSolvingId(id);
    try {
      await toggleQuestionSolved(id);
      const question = questions.find((item) => item._id === id);
      const wasSolved = Boolean(question?.solved);
      setQuestions((prev) =>
        prev.map((q) => (q._id === id ? { ...q, solved: !q.solved } : q))
      );
      if (question?.difficulty) {
        const difficultyKey = question.difficulty.toLowerCase();
        setTopicStats((prev) => {
          if (!prev?.[difficultyKey]) return prev;
          const delta = wasSolved ? -1 : 1;
          return {
            ...prev,
            solved: Math.max(0, (prev.solved || 0) + delta),
            progress: prev.total
              ? Math.round((Math.max(0, (prev.solved || 0) + delta) / prev.total) * 100)
              : 0,
            [difficultyKey]: {
              ...prev[difficultyKey],
              solved: Math.max(0, (prev[difficultyKey].solved || 0) + delta),
            },
          };
        });
      }
    } catch (err) {
      console.error("Solved status error:", err);
      alert("Failed to update solved status");
    } finally {
      setSolvingId(null);
    }
  };

  const handleToggleBookmark = async (id) => {
    setBookmarkingId(id);
    try {
      await toggleBookmark(id);
      setQuestions((prev) =>
        prev.map((q) => (q._id === id ? { ...q, bookmarked: !q.bookmarked } : q))
      );
    } catch (err) {
      console.error("Bookmark error:", err);
      alert("Failed to update bookmark");
    } finally {
      setBookmarkingId(null);
    }
  };

  const handleDifficultyChange = (val) => {
    setDifficulty(val);
  };

  const handlePatternChange = (val) => {
    setPattern(val);
  };

  const patternOptions = useMemo(() => {
    const allTags = [pattern, ...questions.flatMap((q) => q?.tags || [])].filter(tag => tag !== "All");
    return ["All", ...new Set(allTags)].sort((a, b) =>
      a === "All" ? -1 : a.localeCompare(b)
    );
  }, [questions, pattern]);

  const filteredQuestions = questions; // Now handled by server

  if (loading && !topic) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
          Loading topic...
        </div>
      </MainLayout>
    );
  }

  if (!topic) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
          Topic not found
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="practice-layout">
        <main className="practice-main">
          <div className="practice-breadcrumb">
            <Link to="/roadmap">Roadmap</Link><span>/</span><strong>{topic.name}</strong>
          </div>

          <div className="practice-heading">
            <div>
              <p className="eyebrow-label">Coding interviews</p>
              <h1>{topic.name}</h1>
              <p>{topic.description || "Curated questions to build your interview confidence."}</p>
            </div>
            <div className="practice-count-card"><strong>{totalQuestions}</strong><span>questions</span></div>
          </div>

          <div className="practice-toolbar">
            <SearchBar
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="practice-filters">
              <FilterDropdown
                label="Difficulty"
                options={["All", "Easy", "Medium", "Hard", "Unrated"]}
                value={difficulty}
                onChange={handleDifficultyChange}
              />
              <FilterDropdown
                label="Pattern"
                options={patternOptions}
                value={pattern}
                onChange={handlePatternChange}
              />
            </div>
          </div>

          {loading && <p className="practice-updating">Updating results…</p>}

          <QuestionTable
            questions={filteredQuestions}
            onToggleSolved={isAuthenticated ? handleToggleSolved : undefined}
            onToggleBookmark={isAuthenticated ? handleToggleBookmark : undefined}
            solvingId={solvingId}
            bookmarkingId={bookmarkingId}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </main>

          <PracticeSummary
            questions={questions}
            totalQuestions={topicStats?.total || totalQuestions}
            stats={topicStats}
          />
      </div>
    </MainLayout>
  );
}

function PracticeSummary({ questions, totalQuestions, stats }) {
  const easy = stats?.easy?.total ?? questions.filter((question) => question.difficulty === "Easy").length;
  const medium = stats?.medium?.total ?? questions.filter((question) => question.difficulty === "Medium").length;
  const hard = stats?.hard?.total ?? questions.filter((question) => question.difficulty === "Hard").length;
  const solved = stats?.solved ?? questions.filter((question) => question.solved).length;

  return (
    <aside className="practice-summary">
      <div className="practice-summary-card">
        <div className="practice-summary-title"><FaBook /><strong>{totalQuestions || 0} questions</strong></div>
        <div className="practice-summary-ring"><strong>{solved}</strong><span>solved</span></div>
        <div className="practice-difficulty-list">
          <span className="easy-text">Easy <b>{stats?.easy?.solved || 0}/{easy}</b></span>
          <span className="medium-text">Medium <b>{stats?.medium?.solved || 0}/{medium}</b></span>
          <span className="hard-text">Hard <b>{stats?.hard?.solved || 0}/{hard}</b></span>
          {stats?.unrated?.total > 0 && <span>Unrated <b>{stats.unrated.solved || 0}/{stats.unrated.total}</b></span>}
        </div>
      </div>
      <div className="practice-tip-card"><strong>Keep going.</strong><p>Small consistent sessions compound into interview confidence.</p></div>
    </aside>
  );
}

export default TopicDetails;
