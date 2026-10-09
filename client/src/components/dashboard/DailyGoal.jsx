import Card from "../ui/Card";
import ProgressBar from "../ui/ProgressBar";

function DailyGoal() {
  return (
    <Card className="border border-zinc-200 bg-white">

      <h2 className="text-xl font-bold text-zinc-900">
        Daily Goal
      </h2>

      <p className="mt-1 text-sm text-zinc-500">
        Solve 5 Questions
      </p>

      <div className="mt-6">
        <ProgressBar value={40} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-medium text-zinc-500">
        <span>2 / 5 Completed</span>
        <span>40%</span>
      </div>

    </Card>
  );
}

export default DailyGoal;