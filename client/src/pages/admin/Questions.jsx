import { useEffect, useMemo, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import QuestionTable from "../../components/admin/QuestionTable";
import QuestionForm from "../../components/admin/QuestionForm";
import DeleteModal from "../../components/admin/DeleteModal";
import SearchBar from "../../components/admin/SearchBar";
import FilterDropdown from "../../components/admin/FilterDropdown";

import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../services/adminQuestionService";

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState(null);

  const [deleteQuestionData, setDeleteQuestionData] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await getQuestions();
      setQuestions(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (formData) => {
    try {
      if (editingQuestion) {
        await updateQuestion(
          editingQuestion._id,
          formData
        );
      } else {
        await createQuestion(formData);
      }

      setShowModal(false);
      setEditingQuestion(null);

      fetchQuestions();
    } catch (err) {
      console.error(err);
      alert("Operation Failed");
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      console.log(
        "Deleting Question:",
        deleteQuestionData
      );

      const response = await deleteQuestion(
        deleteQuestionData._id
      );

      console.log(
        "Delete Success:",
        response
      );

      setDeleteQuestionData(null);

      fetchQuestions();
    } catch (err) {
      console.error("DELETE ERROR");
      console.error(err);
      console.error(err.response);

      if (err.response) {
        console.error(err.response.data);
        alert(
          err.response.data.message ||
            "Delete Failed"
        );
      } else {
        alert("Delete Failed");
      }
    }
  };

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

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            📚 Questions
          </h1>

          <p className="mt-2 text-slate-400">
            Manage all DSA questions.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingQuestion(null);
            setShowModal(true);
          }}
          className="rounded-lg bg-cyan-600 px-5 py-3 font-semibold hover:bg-cyan-700"
        >
          + Add Question
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search Questions..."
          />
        </div>

        <FilterDropdown
          value={difficulty}
          onChange={setDifficulty}
          options={[
            "All",
            "Easy",
            "Medium",
            "Hard",
          ]}
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          Loading...
        </div>
      ) : (
        <QuestionTable
          questions={filteredQuestions}
          onEdit={(question) => {
            setEditingQuestion(question);
            setShowModal(true);
          }}
          onDelete={(question) => {
            console.log(
              "Selected For Delete:",
              question
            );
            setDeleteQuestionData(question);
          }}
        />
      )}

      {showModal && (
        <QuestionForm
          initialData={editingQuestion}
          onClose={() => {
            setShowModal(false);
            setEditingQuestion(null);
          }}
          onSave={handleSaveQuestion}
        />
      )}

      {deleteQuestionData && (
        <DeleteModal
          title={deleteQuestionData.title}
          onCancel={() =>
            setDeleteQuestionData(null)
          }
          onDelete={handleDeleteQuestion}
        />
      )}
    </AdminLayout>
  );
}

export default Questions;