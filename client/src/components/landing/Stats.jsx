import { useEffect, useState } from "react";
import { getStats } from "../../services/statsService";

function Stats() {
  const [stats, setStats] = useState([
    { number: "—", title: "Questions" },
    { number: "—", title: "Companies" },
    { number: "—", title: "Topics" },
    { number: "—", title: "Sheets" },
  ]);

  useEffect(() => {
    getStats()
      .then((res) => {
        const d = res.data;
        setStats([
          { number: `${d.totalQuestions}+`, title: "Questions" },
          { number: `${d.totalCompanies}+`, title: "Companies" },
          { number: `${d.totalTopics}+`, title: "Topics" },
          { number: `${d.totalSheets}+`, title: "Sheets" },
        ]);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="bg-slate-900 py-24">

      <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-2 lg:grid-cols-4">

        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-slate-800 bg-slate-950 p-10 text-center"
          >
            <h2 className="text-5xl font-bold text-cyan-500">
              {stat.number}
            </h2>

            <p className="mt-4 text-lg text-slate-400">
              {stat.title}
            </p>
          </div>
        ))}

      </div>

    </section>
  );
}

export default Stats;
