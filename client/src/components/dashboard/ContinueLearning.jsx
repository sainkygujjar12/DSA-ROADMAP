import { Link } from "react-router-dom";

import Card from "../ui/Card";
import Button from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";

function ContinueLearning({ data, progress }) {
  if (!data || !data.title) {
    return (
      <Card>
        <h2 className="text-2xl font-bold">
          Continue Learning
        </h2>

        <p className="mt-4 text-slate-400">
          You haven't started solving questions yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-800 bg-slate-900">

      <h2 className="text-2xl font-bold">
        ▶ Continue Learning
      </h2>

      <p className="mt-6 text-sm text-slate-400">
        Last Visited Question
      </p>

      <h3 className="mt-2 text-2xl font-semibold">
        {data.title}
      </h3>

      <p className="mt-2 text-slate-400">
        Difficulty : {data.difficulty}
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