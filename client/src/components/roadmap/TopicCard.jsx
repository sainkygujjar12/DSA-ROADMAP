import { Link } from "react-router-dom";
import Card from "../ui/Card";
import ProgressBar from "../ui/ProgressBar";
import Badge from "../ui/Badge";
import TopicIcon from "../common/TopicIcon";

function TopicCard({ topic }) {
  return (
    <Card className="group transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <TopicIcon slug={topic.slug} size={28} />

        <span className="text-sm text-slate-400">
          {topic.totalQuestions} Questions
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-bold">
        {topic.name}
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        {topic.description}
      </p>

      <div className="mt-6">
        <ProgressBar value={topic.progress} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge color="green">
          Easy {topic.easy}
        </Badge>

        <Badge color="yellow">
          Medium {topic.medium}
        </Badge>

        <Badge color="red">
          Hard {topic.hard}
        </Badge>
      </div>

      <Link
        to={`/roadmap/${topic.slug}`}
        className="mt-8 inline-flex items-center font-semibold text-cyan-500 transition group-hover:translate-x-1"
      >
        Start Learning →
      </Link>
    </Card>
  );
}

export default TopicCard;
