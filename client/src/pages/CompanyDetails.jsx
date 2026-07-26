import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import Loader from "../components/ui/Loader";
import TopicHeader from "../components/topic/TopicHeader";
import CompanyIcon from "../components/ui/CompanyIcon";
import SearchBar from "../components/topic/SearchBar";
import QuestionTable from "../components/topic/QuestionTable";
import FilterDropdown from "../components/ui/FilterDropdown";

import { getCompanyBySlug } from "../services/companyService";
import { getProgress } from "../services/progressService";

function CompanyDetails() {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState("All");
  const [pattern, setPattern] = useState("All");

  useEffect(() => {
    async function fetchData() {
      try {
        const [companyResponse, progressResponse] =
          await Promise.all([
            getCompanyBySlug(slug),
            getProgress(),
          ]);

        const companyData =
          companyResponse?.data?.company || null;

        const questionData =
          companyResponse?.data?.questions || [];

        const solvedIds =
          progressResponse?.data?.solvedQuestions?.map(
            (q) => q?._id
          ) || [];

        const updatedQuestions = questionData.map(
          (question) => ({
            ...question,
            solved: solvedIds.includes(question?._id),
          })
        );

        setCompany(companyData);
        setQuestions(updatedQuestions);
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
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout>
        <h2 className="text-center text-xl">
          Company not found
        </h2>
      </DashboardLayout>
    );
  }

  // ================= PROGRESS =================
  const solvedCount = questions.filter(
    (q) => q.solved
  ).length;

  const header = {
    name: company?.name,
    description: `${questions.length} Questions`,
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
    <DashboardLayout>
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
    </DashboardLayout>
  );
}

export default CompanyDetails;