import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import QuestionTable from "../components/topic/QuestionTable";
import SearchBar from "../components/topic/SearchBar";
import FilterDropdown from "../components/ui/FilterDropdown";
import { getSheetBySlug } from "../services/sheetService";

function SheetDetails() {
  const { slug } = useParams();

  const [sheet, setSheet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [pattern, setPattern] = useState("All");

  useEffect(() => {
    fetchSheet();
  }, [slug]);

  const fetchSheet = async () => {
    try {
      const res = await getSheetBySlug(slug);

      setSheet(res.data.sheet);
      setQuestions(res.data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        matchesSearch && matchesDifficulty && matchesPattern
      );
    });
  }, [questions, search, difficulty, pattern]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-white">
          Loading...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          📋 {sheet?.name}
        </h1>

        <p className="mt-2 text-slate-400">
          👤 {sheet?.author}
        </p>

        <p className="mt-4 text-slate-300">
          {sheet?.description}
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

export default SheetDetails;
