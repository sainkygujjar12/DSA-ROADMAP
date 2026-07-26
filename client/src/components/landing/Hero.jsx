import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCode,
  FaFire,
  FaTrophy,
} from "react-icons/fa";

import { getStats } from "../../services/statsService";

function Hero() {
  const [stats, setStats] = useState([
    { title: "—", subtitle: "Questions" },
    { title: "—", subtitle: "Companies" },
    { title: "—", subtitle: "Topics" },
    { title: "—", subtitle: "Sheets" },
  ]);

  useEffect(() => {
    getStats()
      .then((res) => {
        const d = res.data;
        setStats([
          { title: `${d.totalQuestions}+`, subtitle: "Questions" },
          { title: `${d.totalCompanies}+`, subtitle: "Companies" },
          { title: `${d.totalTopics}+`, subtitle: "Topics" },
          { title: `${d.totalSheets}+`, subtitle: "Sheets" },
        ]);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-950">

      {/* Background Glow */}

      <div className="absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-600/20 blur-[150px]" />

      <div className="absolute right-10 top-10 h-72 w-72 rounded-full bg-teal-600/20 blur-[120px]" />

      <div className="mx-auto grid min-h-[90vh] max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2">

        {/* Left */}

        <motion.div
          initial={{
            opacity: 0,
            x: -60,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
          }}
        >

          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm text-cyan-400">
            🚀 The Ultimate DSA Platform
          </span>

          <h1 className="mt-8 text-6xl font-extrabold leading-tight text-white">

            Master

            <span className="block bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">

              Data Structures

            </span>

            & Algorithms

          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400">

            Learn DSA using an interactive roadmap,
            company-wise preparation,
            sheet-wise practice,
            progress tracking,
            bookmarks,
            notes,
            and much more.

          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <Link
              to="/roadmap"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-8 py-4 font-semibold transition hover:scale-105"
            >
              Start Learning

              <FaArrowRight />
            </Link>

            <Link
              to="/companies"
              className="rounded-xl border border-slate-700 px-8 py-4 transition hover:border-cyan-500 hover:bg-slate-900"
            >
              Explore Companies
            </Link>

          </div>

          {/* Stats */}

          <div className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4">

            {stats.map((item) => (
              <div
                key={item.subtitle}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center"
              >
                <h2 className="text-3xl font-bold text-cyan-500">
                  {item.title}
                </h2>

                <p className="mt-2 text-slate-400">
                  {item.subtitle}
                </p>
              </div>
            ))}

          </div>

        </motion.div>

        {/* Right */}

        <motion.div
          initial={{
            opacity: 0,
            x: 60,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          className="relative"
        >

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

            <div className="mb-8 flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                Your Progress
              </h2>

              <FaCode className="text-3xl text-cyan-500" />

            </div>

            <div className="space-y-5">

              <div className="rounded-xl bg-slate-800 p-5">

                <div className="flex justify-between">

                  <span>Arrays</span>

                  <span>90%</span>

                </div>

                <div className="mt-3 h-3 rounded-full bg-slate-700">

                  <div className="h-3 w-[90%] rounded-full bg-cyan-500" />

                </div>

              </div>

              <div className="rounded-xl bg-slate-800 p-5">

                <div className="flex justify-between">

                  <span>Graphs</span>

                  <span>70%</span>

                </div>

                <div className="mt-3 h-3 rounded-full bg-slate-700">

                  <div className="h-3 w-[70%] rounded-full bg-teal-500" />

                </div>

              </div>

              <div className="rounded-xl bg-slate-800 p-5">

                <div className="flex items-center gap-3">

                  <FaFire className="text-orange-500" />

                  <div>

                    <h3 className="font-semibold">
                      42 Day Streak
                    </h3>

                    <p className="text-sm text-slate-400">
                      Keep solving daily!
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-xl bg-slate-800 p-5">

                <div className="flex items-center gap-3">

                  <FaTrophy className="text-yellow-500" />

                  <div>

                    <h3 className="font-semibold">
                      342 Questions Solved
                    </h3>

                    <p className="text-sm text-slate-400">
                      You're doing great.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}

export default Hero;