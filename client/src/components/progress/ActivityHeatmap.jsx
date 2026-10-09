function ActivityHeatmap({ activity = [], year }) {
  const activityByDate = new Map(
    activity.map((entry) => [entry.date, Number(entry.count) || 0])
  );
  const start = new Date(year, 0, 1);
  const daysInYear = new Date(year + 1, 0, 1).getTime() - start.getTime();
  const totalDays = Math.round(daysInYear / (24 * 60 * 60 * 1000));
  const cells = Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(year, 0, index + 1);
    const key = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const count = activityByDate.get(key) || 0;
      return {
        key,
        count,
        level: Math.min(count, 4),
      };
  });

  return (
    <div className="activity-grid-wrap">
      <div className="activity-months"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span></div>
      <div className="activity-grid">
        {cells.map((cell, index) => (
          <span
            key={index}
            className={`activity-cell level-${cell.level}`}
            title={`${cell.count} solve${cell.count === 1 ? "" : "s"} on ${cell.key}`}
          />
        ))}
      </div>
      <div className="activity-legend"><span>Less</span><i className="level-0" /><i className="level-1" /><i className="level-2" /><i className="level-3" /><span>More</span></div>
    </div>
  );
}

export default ActivityHeatmap;
