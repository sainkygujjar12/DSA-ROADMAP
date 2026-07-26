import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import QuestionTable from "../components/topic/QuestionTable";
import SearchBar from "../components/topic/SearchBar";
import FilterDropdown from "../components/ui/FilterDropdown";
import { getTopicBySlug } from "../services/topicService";

function TopicDetails() {
  const { slug } = useParams();

  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [pattern, setPattern] = useState("All");

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

  // ================= LOADING =================
  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-white">
          Loading topic...
        </div>
      </MainLayout>
    );
  }

  // ================= NOT FOUND =================
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

      {/* Back */}
      <Link
        to="/roadmap"
        className="text-cyan-400 hover:underline"
      >
        ← Back to Roadmap
      </Link>

      {/* Header */}
      <div className="mt-6 mb-8">
        <h1 className="text-4xl font-bold">
          📘 {topic?.name}
        </h1>

        <p className="mt-2 text-slate-400">
          {topic?.description}
        </p>
      </div>

      {/* Search */}
      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filters */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
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

      {/* Questions */}
      <QuestionTable questions={filteredQuestions} />

    </MainLayout>
  );
}

export default TopicDetails;