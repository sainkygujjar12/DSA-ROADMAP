import { FiCode, FiLayers, FiBriefcase, FiBookOpen, FiUsers } from "react-icons/fi";
import StatsCard from "./StatsCard";

function StatsGrid({
  stats = {
    totalQuestions: 0,
    totalTopics: 0,
    totalCompanies: 0,
    totalSheets: 0,
    totalUsers: 0,
  },
}) {
  return (
    <div className="admin-stats-grid">

      <StatsCard
        title="Questions"
        value={stats.totalQuestions ?? 0}
        icon={<FiCode />}
      />

      <StatsCard
        title="Topics"
        value={stats.totalTopics ?? 0}
        icon={<FiLayers />}
      />

      <StatsCard
        title="Companies"
        value={stats.totalCompanies ?? 0}
        icon={<FiBriefcase />}
      />

      <StatsCard
        title="Sheets"
        value={stats.totalSheets ?? 0}
        icon={<FiBookOpen />}
      />

      <StatsCard
        title="Users"
        value={stats.totalUsers ?? 0}
        icon={<FiUsers />}
      />

    </div>
  );
}

export default StatsGrid;