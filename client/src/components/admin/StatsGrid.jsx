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
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

      <StatsCard
        title="Questions"
        value={stats.totalQuestions ?? 0}
        icon="📚"
      />

      <StatsCard
        title="Topics"
        value={stats.totalTopics ?? 0}
        icon="🧩"
      />

      <StatsCard
        title="Companies"
        value={stats.totalCompanies ?? 0}
        icon="🏢"
      />

      <StatsCard
        title="Sheets"
        value={stats.totalSheets ?? 0}
        icon="📋"
      />

      <StatsCard
        title="Users"
        value={stats.totalUsers ?? 0}
        icon="👥"
      />

    </div>
  );
}

export default StatsGrid;