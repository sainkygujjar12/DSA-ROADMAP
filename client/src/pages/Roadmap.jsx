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
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold">
          📍 DSA Roadmap
        </h1>

        <p className="mt-2 text-slate-400">
          Follow a structured path to master DSA.
        </p>
      </div>

      {/* Empty State */}
      {topics.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
          No topics found.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {topics.map((topic, index) => (
            <Link
              key={topic._id}
              to={`/roadmap/${topic.slug}`}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-2 hover:border-cyan-500 hover:shadow-lg"
            >

              {/* Step */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Step {index + 1}
                </p>

                <span className="text-3xl">
                  {topic.icon}
                </span>
              </div>

              {/* Title */}
              <h2 className="mt-2 text-2xl font-bold">
                {topic.name}
              </h2>

              {/* Description */}
              <p className="mt-3 text-sm text-slate-400">
                {topic.description ||
                  "Master this topic step by step"}
              </p>

              {/* CTA */}
              <div className="mt-6 font-medium text-cyan-400">
                Start Learning →
              </div>

            </Link>
          ))}

        </div>
      )}
    </MainLayout>
  );
}

export default Roadmap;