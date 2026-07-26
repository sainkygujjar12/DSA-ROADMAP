import { useEffect, useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import StatsGrid from "../../components/admin/StatsGrid";
import QuickActions from "../../components/admin/QuickActions";
import RecentQuestions from "../../components/admin/RecentQuestions";

import { getAdminDashboard } from "../../services/adminService";

function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalTopics: 0,
    totalCompanies: 0,
    totalSheets: 0,
    totalUsers: 0,
  });

  const [recentQuestions, setRecentQuestions] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getAdminDashboard();

        console.log("Admin Dashboard Response:", response);

        if (response.success && response.data) {
          setStats(response.data.stats || {});

          setRecentQuestions(
            response.data.recentQuestions || []
          );
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <h1 className="text-3xl font-bold">
          Loading...
        </h1>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="mb-8 text-4xl font-bold">
        👑 Admin Dashboard
      </h1>

      <StatsGrid stats={stats} />

      <div className="mt-10">
        <QuickActions />
      </div>

      <div className="mt-10">
        <RecentQuestions
          questions={recentQuestions}
        />
      </div>
    </AdminLayout>
  );
}

export default Dashboard;