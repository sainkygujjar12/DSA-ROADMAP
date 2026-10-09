import ProgressBar from "../ui/ProgressBar";
import TopicIcon from "../common/TopicIcon";

function TopicHeader({ topic, iconNode }) {
  return (
    <section className="topic-hero-card">
      <div className="topic-hero-main">
        {iconNode || <TopicIcon slug={topic.slug} size={28} />}
        <div>
          <p className="eyebrow-label">Practice path</p>
          <h1>{topic.name}</h1>
          <p>{topic.description}</p>
        </div>
      </div>

      <div className="topic-hero-progress">
        <div className="topic-hero-progress-top">
          <span>Your progress</span>
          <strong>{topic.progress || 0}%</strong>
        </div>
        <ProgressBar value={topic.progress || 0} />
      </div>

      <div className="topic-hero-stats">
        <span>▣ {topic.totalQuestions || 0} Questions</span>
        <span className="easy">Easy {topic.easy || 0}</span>
        <span className="medium">Medium {topic.medium || 0}</span>
        <span className="hard">Hard {topic.hard || 0}</span>
      </div>
    </section>
  );
}

export default TopicHeader;
