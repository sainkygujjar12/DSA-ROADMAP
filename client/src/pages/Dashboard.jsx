import { useEffect, useState } from "react";

import {
  FaCheckCircle,
  FaCheck,
  FaFire,
  FaChartLine,
} from "react-icons/fa";

import DashboardLayout from "../components/layout/DashboardLayout";

import StatsCard from "../components/dashboard/StatsCard";
import ContinueLearning from "../components/dashboard/ContinueLearning";
import RecentActivity from "../components/dashboard/RecentActivity";
import DailyGoal from "../components/dashboard/DailyGoal";

import ProgressBar from "../components/ui/ProgressBar";

import { getDashboard } from "../services/dashboardService";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await getDashboard();

        setStats(response?.data || null);
      } catch (error) {
        console.error("Dashboard error:", error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  // ================= LOADING =================
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <h1 className="text-xl text-slate-400">
            Loading dashboard...
          </h1>
        </div>
      </DashboardLayout>
    );
  }

  // ================= ERROR STATE =================
  if (!stats) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <h1 className="text-xl text-red-400">
            Failed to load dashboard
          </h1>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">

        {/* Hero */}
        <div>
          <h1 className="text-4xl font-bold">
            Welcome Back, {stats?.user?.name || "User"} 👋
          </h1>

          <p className="mt-2 text-slate-400">
            Keep your DSA streak alive 🔥
          </p>
        </div>

        {/* Progress */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Overall Progress
            </h2>

            <span className="text-xl font-semibold text-cyan-400">
              {stats?.stats?.overallProgress || 0}%
            </span>

          </div>

          <div className="mt-5">
            <ProgressBar
              value={stats?.stats?.overallProgress || 0}
            />
          </div>

        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <StatsCard
            title="Solved"
            value={stats?.stats?.totalSolved || 0}
            icon={<FaCheckCircle />}
            color="text-green-500"
          />

          <StatsCard
            title="Easy"
            value={stats?.stats?.easySolved || 0}
            icon={<FaCheck />}
            color="text-green-400"
          />

          <StatsCard
            title="Medium"
            value={stats?.stats?.mediumSolved || 0}
            icon={<FaChartLine />}
            color="text-yellow-500"
          />

          <StatsCard
            title="Hard"
            value={stats?.stats?.hardSolved || 0}
            icon={<FaFire />}
            color="text-red-500"
          />

        </div>

        {/* Continue + Daily Goal */}
        <div className="grid gap-6 lg:grid-cols-2">

          <ContinueLearning
            data={stats?.continueLearning || null}
            progress={stats?.stats?.overallProgress || 0}
          />

          <DailyGoal />
        </div>

        {/* Recent Activity */}
        <RecentActivity
          recentSolved={stats?.recentSolved || []}
        />

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;