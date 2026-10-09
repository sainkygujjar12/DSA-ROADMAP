import { useEffect, useMemo, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import TopicTable from "../../components/admin/TopicTable";
import TopicForm from "../../components/admin/TopicForm";
import DeleteModal from "../../components/admin/DeleteModal";
import SearchBar from "../../components/admin/SearchBar";

import {
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../../services/adminTopicService";

function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingTopic, setEditingTopic] =
    useState(null);

  const [deleteTopicData, setDeleteTopicData] =
    useState(null);



  const fetchTopics = async () => {
    try {
      const response = await getTopics();

      setTopics(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getTopics().then(response => { if (active) setTopics(response.data || []); })
      .catch(error => console.error(error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSaveTopic = async (
    formData
  ) => {
    try {
      if (editingTopic) {
        await updateTopic(
          editingTopic._id,
          formData
        );
      } else {
        await createTopic(formData);
      }

      setShowModal(false);
      setEditingTopic(null);

      fetchTopics();
    } catch (err) {
      console.error(err);
      alert("Operation Failed");
    }
  };

  const handleDeleteTopic = async () => {
    try {
      await deleteTopic(deleteTopicData._id);

      setDeleteTopicData(null);

      fetchTopics();
    } catch (err) {
      console.error(err);
      alert("Delete Failed");
    }
  };

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) =>
      topic.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [topics, search]);

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold">
            🧩 Topics
          </h1>

          <p className="mt-2 text-slate-400">
            Manage all DSA topics.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTopic(null);
            setShowModal(true);
          }}
          className="rounded-lg bg-cyan-600 px-5 py-3 font-semibold hover:bg-cyan-700"
        >
          + Add Topic
        </button>

      </div>

      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search Topics..."
        />
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          Loading...
        </div>
      ) : (
        <TopicTable
          topics={filteredTopics}
          onEdit={(topic) => {
            setEditingTopic(topic);
            setShowModal(true);
          }}
          onDelete={(topic) =>
            setDeleteTopicData(topic)
          }
        />
      )}

      {showModal && (
        <TopicForm key={editingTopic?._id || "new"}
          initialData={editingTopic}
          onClose={() => {
            setShowModal(false);
            setEditingTopic(null);
          }}
          onSave={handleSaveTopic}
        />
      )}

      {deleteTopicData && (
        <DeleteModal
          title={deleteTopicData.name}
          onCancel={() =>
            setDeleteTopicData(null)
          }
          onDelete={handleDeleteTopic}
        />
      )}

    </AdminLayout>
  );
}

export default Topics;