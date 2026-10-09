import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import Loader from "../components/ui/Loader";

import {
  getProgress,
  deleteNote,
} from "../services/progressService";

function Notes() {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);





  useEffect(() => {
    let active = true;
    getProgress().then(response => { if (active) setNotes(response.data.notes || []); })
      .catch(error => console.error(error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleDelete = async (questionId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) return;

    try {
      await deleteNote(questionId);

      setNotes((prev) =>
        prev.filter(
          (note) =>
            note.question._id !== questionId
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete note.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <h1 className="text-4xl font-bold">
          📝 My Notes
        </h1>

        <p className="text-slate-400">
          {notes.length} Saved Notes
        </p>

        {notes.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-2xl font-semibold">
              No Notes Yet
            </h2>

            <p className="mt-3 text-slate-400">
              Open any question and write notes.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {notes.map((note) => (
              <div
                key={note._id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex items-start justify-between">

                  <div>
                    <h2 className="text-2xl font-bold">
                      {note.question.title}
                    </h2>

                    <p className="mt-4 whitespace-pre-wrap text-slate-300">
                      {note.content}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleDelete(
                        note.question._id
                      )
                    }
                    className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
                  >
                    🗑 Delete
                  </button>

                </div>

                <Link
                  to={`/questions/${note.question.slug}`}
                  className="mt-6 inline-block text-cyan-500 hover:underline"
                >
                  Open Question →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Notes;