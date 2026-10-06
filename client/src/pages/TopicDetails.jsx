import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import QuestionTable from "../components/topic/QuestionTable";
import SearchBar from "../components/topic/SearchBar";
import FilterDropdown from "../components/ui/FilterDropdown";
import { getTopicBySlug } from "../services/topicService";
import { toggleQuestionSolved, toggleBookmark } from "../services/progressService";

function TopicDetails() {
  const { slug } = useParams();

  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [pattern, setPattern] = useState("All");

  // Track which question is currently being updated to show loader in row
  const [solvingId, setSolvingId] = useState(null);
  const [bookmarkingId, setBookmarkingId] = useState(null);

  useEffect(() => {
    fetchTopic();
  }, [slug]);

  const fetchTopic = async () => {
    try {
      const res = await getTopicBySlug(slug);
      setTopic(res?.data?.topic || null);
      setQuestions(res?.data?.questions || []);
    } catch (err) {
      console.error("TopicDetails error:", err);
      setTopic(null);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSolved = async (id) => {
    setSolvingId(id);
    try {
      await toggleQuestionSolved(id);
      setQuestions((prev) =>
        prev.map((q) => (q._id === id ? { ...q, solved: !q.solved } : q))
      );
    } catch (err) {
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
      alert("Failed to update bookmark");
    } finally {
      setBookmarkingId(null);
    }
  };

  const patternOptions = useMemo(() => {
    const allTags = questions.flatMap((q) => q?.tags || []);
    return ["All", ...new Set(allTags)].sort((a, b) =>
      a === "All" ? -1 : a.localeCompare(b)
    );
  }, [questions]);

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
        matchesSearch && matchesDifficulty && matchesPattern
      );
    });
  }, [questions, search, difficulty, pattern]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-white">
          Loading topic...
        </div>
      </MainLayout>
    );
  }

  if (!topic) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-white">
          Topic not found
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-2 mb-8">
        <Link
          to="/roadmap"
          className="text-sm text-cyan-400 hover:text-cyan-300 transition"
        >
          ← Back to Roadmap
        </Link>
        <h1 className="text-4xl font-bold">
          {topic?.name}
        </h1>
        <p className="text-slate-400 max-w-2xl">
          {topic?.description}
        </p>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-4 overflow-x-auto pb-2">
          <FilterDropdown
            label="Difficulty"
            options={["All", "Easy", "Medium", "Hard"]}
            value={difficulty}
            onChange={setDifficulty}
          />
          <FilterDropdown
            label="Pattern"
            options={patternOptions}
            value={pattern}
            onChange={setPattern}
          />
        </div>
      </div>

      <QuestionTable
        questions={filteredQuestions}
        onToggleSolved={handleToggleSolved}
        onToggleBookmark={handleToggleBookmark}
        solvingId={solvingId}
        bookmarkingId={bookmarkingId}
      />
    </MainLayout>
  );
}

export default TopicDetails;
