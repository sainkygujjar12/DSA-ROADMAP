import { Link } from "react-router-dom";

import Card from "../ui/Card";
import Button from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";

function ContinueLearning({ data, progress }) {
  if (!data || !data.title) {
    return (
      <Card className="border border-zinc-200 bg-white">
        <h2 className="text-xl font-bold text-zinc-900">
          Continue Learning
        </h2>

        <p className="mt-4 text-sm text-zinc-500">
          You haven't started solving questions yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border border-zinc-200 bg-white">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900">
          ▶ Continue Learning
        </h2>
        <span className="text-xs font-medium text-zinc-400">Last Visited</span>
      </div>

      <h3 className="mt-6 text-2xl font-semibold text-zinc-900">
        {data.title}
      </h3>

      <p className="mt-2 text-sm text-zinc-500">
        Difficulty : <span className="font-medium text-zinc-700">{data.difficulty}</span>
      </p>

      <div className="mt-8">
        <ProgressBar value={progress} />
      </div>

      <div className="mt-8">
        <Link to={`/questions/${data.slug}`}>
          <Button>
            Resume Learning →
          </Button>
        </Link>
      </div>

    </Card>
  );
}

export default ContinueLearning;