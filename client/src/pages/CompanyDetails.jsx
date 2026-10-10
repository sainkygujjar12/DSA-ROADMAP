import usePracticeList from "../hooks/usePracticeList";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/ui/Loader";
import TopicHeader from "../components/topic/TopicHeader";
import CompanyIcon from "../components/ui/CompanyIcon";
import SearchBar from "../components/topic/SearchBar";
import QuestionTable from "../components/topic/QuestionTable";
import FilterDropdown from "../components/ui/FilterDropdown";

import { getCompanyBySlug } from "../services/companyService";

function CompanyDetails() {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const { search, difficulty, topic, pattern, setField } = usePracticeList(!loading);
  const setSearch = value => setField("search", value);
  const setDifficulty = value => setField("difficulty", value);
  const setTopic = value => setField("topic", value);
  const setPattern = value => setField("pattern", value);
  const [company, setCompany] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const companyResponse = await getCompanyBySlug(slug);

        const companyData =
          companyResponse?.data?.company || null;

        const questionData =
          companyResponse?.data?.questions || [];

        setCompany(companyData);
        setQuestions(questionData);
      } catch (error) {
        console.error("CompanyDetails error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  // ================= FILTER LOGIC =================
  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesSearch = question?.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesDifficulty =
        difficulty === "All" ||
        question?.difficulty === difficulty;

      const matchesTopic =
        topic === "All" ||
        question?.topic?.name === topic;

      const matchesPattern =
        pattern === "All" ||
        question?.tags?.includes(pattern);

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesTopic &&
        matchesPattern
      );
    });
  }, [questions, search, difficulty, topic, pattern]);

  // ================= PATTERN OPTIONS =================
  const patternOptions = useMemo(() => {
    const allTags = questions.flatMap((q) => q?.tags || []);
    return ["All", ...new Set(allTags)].sort((a, b) =>
      a === "All" ? -1 : a.localeCompare(b)
    );
  }, [questions]);

  // ================= TOPIC OPTIONS =================
  const topicOptions = useMemo(() => {
    return [
      "All",
      ...new Set(
        questions
          .map((q) => q?.topic?.name)
          .filter(Boolean)
      ),
    ];
  }, [questions]);

  if (loading) {
    return (
      <MainLayout>
        <Loader />
      </MainLayout>
    );
  }

  if (!company) {
    return (
      <MainLayout>
        <h2 className="text-center text-xl">
          Company not found
        </h2>
      </MainLayout>
    );
  }

  // ================= PROGRESS =================
  const solvedCount = questions.filter(
    (q) => q.solved
  ).length;

  const header = {
    name: company?.name,
    description: company.description || `${questions.length} Questions`,
    totalQuestions: questions.length,
    easy: questions.filter(
      (q) => q.difficulty === "Easy"
    ).length,
    medium: questions.filter(
      (q) => q.difficulty === "Medium"
    ).length,
    hard: questions.filter(
      (q) => q.difficulty === "Hard"
    ).length,
    progress:
      questions.length === 0
        ? 0
        : Math.round(
            (solvedCount / questions.length) * 100
          ),
  };

  return (
    <MainLayout>
      {/* Back */}
      <div className="mb-6">
        <Link
          to="/companies"
          className="text-cyan-500 hover:underline"
        >
          ← Back to Companies
        </Link>
      </div>

      {/* Header */}
      <TopicHeader
        topic={header}
        iconNode={
          <CompanyIcon company={company} size="lg" />
        }
      />

      {/* Search */}
      {company.sourceUrl && (
        <p className="mb-6 text-sm text-slate-400">
          {company.sourceNote}{" "}
          <a href={company.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-500 underline">
            View company question source
          </a>
        </p>
      )}
      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Filters */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <FilterDropdown
          label="Difficulty"
          options={["All", "Easy", "Medium", "Hard"]}
          value={difficulty}
          onChange={setDifficulty}
        />

        <FilterDropdown
          label="Topic"
          options={topicOptions}
          value={topic}
          onChange={setTopic}
        />

        <FilterDropdown
          label="Pattern"
          options={patternOptions}
          value={pattern}
          onChange={setPattern}
        />
      </div>

      {/* Table */}
      <QuestionTable questions={filteredQuestions} />
    </MainLayout>
  );
}

export default CompanyDetails;
