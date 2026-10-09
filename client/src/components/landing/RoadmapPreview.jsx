import {
  FaArrowRight,
  FaCode,
  FaCubes,
  FaLayerGroup,
  FaProjectDiagram,
  FaRandom,
  FaSitemap,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const topics = [
  ["Arrays", "arrays", FaLayerGroup, "Start with the patterns behind most interviews."],
  ["Strings", "strings", FaCode, "Build confidence with matching and parsing problems."],
  ["Linked List", "linked-list", FaRandom, "Make pointer movement feel natural."],
  ["Stack", "stack", FaCubes, "Learn the structure behind monotonic patterns."],
  ["Trees", "trees", FaSitemap, "Move from traversal to recursive thinking."],
  ["Graphs", "graph", FaProjectDiagram, "Model relationships and search them cleanly."],
  ["Heap", "heap", FaLayerGroup, "Choose the right priority structure quickly."],
  ["Dynamic Programming", "dynamic-programming", FaCode, "Turn repeated work into a reliable method."],
];

function RoadmapPreview({ roadmap }) {
  return (
    <section className="landing-section landing-roadmap-preview" aria-labelledby="roadmap-preview-heading">
      <div className="landing-container">
        <div className="landing-section-heading landing-section-heading-centered">
          <div>
            <p className="landing-eyebrow">A path you can actually follow</p>
            <h2 id="roadmap-preview-heading">Start anywhere. Know what comes next<span>.</span></h2>
          </div>
          <p>Explore the foundations, then keep moving through the patterns that compound your interview skill.</p>
        </div>

        <div className="landing-topic-grid">
          {topics.map(([name, slug, Icon, description]) => (
            <Link key={slug} to={`/roadmap/${slug}`} className="landing-topic-card">
              <span className="landing-topic-icon"><Icon /></span>
              <h3>{name}</h3>
              <p>{description}</p>
              <span className="text-sm text-slate-400">
                {roadmap.loading ? "Loading…" : roadmap.error ? "Progress unavailable" : (() => {
                  const topic = roadmap.topics.find((item) => item.slug === slug);
                  return roadmap.isAuthenticated
                    ? `${topic?.solvedQuestions || 0}/${topic?.totalQuestions || 0} solved`
                    : `${topic?.totalQuestions || 0} questions`;
                })()}
              </span>
              <span className="landing-card-link">Explore <FaArrowRight /></span>
            </Link>
          ))}
        </div>

        <Link to="/roadmap" className="landing-outline-button">Open the full roadmap <FaArrowRight /></Link>
      </div>
    </section>
  );
}

export default RoadmapPreview;
