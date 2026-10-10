import usePracticeList from "../hooks/usePracticeList";
import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";
import Loader from "../components/ui/Loader";
import SearchBar from "../components/topic/SearchBar";
import QuestionTable from "../components/topic/QuestionTable";
import FilterDropdown from "../components/ui/FilterDropdown";

import { getProgress } from "../services/progressService";

function Bookmarks() {
  const [loading, setLoading] = useState(true);
  const { search, difficulty, setField } = usePracticeList(!loading);
  const setSearch = value => setField("search", value);
  const setDifficulty = value => setField("difficulty", value);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const response = await getProgress();

        const bookmarked =
          response.data.bookmarkedQuestions.map((q) => ({
            ...q,
            bookmarked: true,
          }));

        setQuestions(bookmarked);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarks();
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesSearch = question.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesDifficulty =
        difficulty === "All" ||
        question.difficulty === difficulty;

      return (
        matchesSearch &&
        matchesDifficulty
      );
    });
  }, [questions, search, difficulty]);

  if (loading) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <div className="saved-page-heading"><p className="eyebrow-label">Your library</p><h1>Bookmarked questions</h1><p>Keep the questions you want to revisit in one place.</p></div>

      <SearchBar
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <div className="mb-6">
        <FilterDropdown
          label="Difficulty"
          options={[
            "All",
            "Easy",
            "Medium",
            "Hard",
          ]}
          value={difficulty}
          onChange={setDifficulty}
        />
      </div>

      <QuestionTable
        questions={filteredQuestions}
      />

    </DashboardLayout>
  );
}

export default Bookmarks;