import ProgressBar from "../ui/ProgressBar";

function TopicHeader({ topic, iconNode }) {
  return (
    <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-4">
        {iconNode ? (
          iconNode
        ) : (
          <span className="text-5xl">{topic.icon}</span>
        )}

        <div>
          <h1 className="text-4xl font-bold">
            {topic.name}
          </h1>

          <p className="mt-2 text-slate-400">
            {topic.description}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ProgressBar value={topic.progress} />
      </div>

      <div className="mt-5 flex gap-8 text-sm">

        <p>
          📄 {topic.totalQuestions} Questions
        </p>

        <p className="text-green-400">
          Easy {topic.easy}
        </p>

        <p className="text-yellow-400">
          Medium {topic.medium}
        </p>

        <p className="text-red-400">
          Hard {topic.hard}
        </p>

      </div>
    </div>
  );
}

export default TopicHeader;