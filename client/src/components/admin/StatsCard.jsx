export default function StatsCard({ title, value, icon }) {
  return <div className="admin-stat-card"><span className="admin-stat-icon" aria-hidden="true">{icon}</span><p>{title}</p><strong>{value}</strong></div>;
}
