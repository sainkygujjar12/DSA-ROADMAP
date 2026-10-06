import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import { getTopics } from "../services/topicService";

function Roadmap() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await getTopics();
      setTopics(res?.data || []);
    } catch (err) {
      console.error("Roadmap error:", err);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-white">
          Loading roadmap...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-12 max-w-4xl">
        <h1 className="text-4xl font-bold">📍 DSA Roadmap</h1>
        <p className="mt-2 text-slate-400">
          A structured path to master data structures and algorithms.
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
          No topics found.
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-4xl">
          {topics.map((topic, index) => (
            <Link
              key={topic._id}
              to={`/roadmap/${topic.slug}`}
              className="group flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-5 transition hover:border-cyan-500/50 hover:bg-slate-900"
            >
              <div className="flex items-center gap-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-200 group-hover:text-white transition">
                    {topic.name}
                  </h2>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {topic.description || "Master this topic step by step"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-2xl opacity-50 group-hover:opacity-100 transition">
                  {topic.icon}
                </span>
                <span className="hidden sm:block text-sm font-medium text-cyan-500 opacity-0 group-hover:opacity-100 transition">
                  Study →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
}

export default Roadmap;
