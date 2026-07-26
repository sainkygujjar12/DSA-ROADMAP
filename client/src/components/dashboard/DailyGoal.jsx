import Card from "../ui/Card";
import ProgressBar from "../ui/ProgressBar";

function DailyGoal() {
  return (
    <Card>

      <h2 className="text-2xl font-bold">
        Daily Goal
      </h2>

      <p className="mt-2 text-slate-400">
        Solve 5 Questions
      </p>

      <div className="mt-5">
        <ProgressBar value={40} />
      </div>

      <p className="mt-3 text-sm text-slate-400">
        2 / 5 Completed
      </p>

    </Card>
  );
}

export default DailyGoal;