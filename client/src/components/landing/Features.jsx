import {
  FaArrowRight,
  FaBookOpen,
  FaBookmark,
  FaBuilding,
  FaChartLine,
  FaClipboardList,
  FaCode,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const features = [
  {
    icon: FaCode,
    label: "01",
    title: "Topic-wise roadmap",
    desc: "A clear path from arrays to dynamic programming, with every next step visible.",
    href: "/roadmap",
  },
  {
    icon: FaBuilding,
    label: "02",
    title: "Company patterns",
    desc: "See which problems appear most often at the companies you want to join.",
    href: "/companies",
  },
  {
    icon: FaClipboardList,
    label: "03",
    title: "Curated sheets",
    desc: "Use focused collections when you want a shorter, high-signal practice plan.",
    href: "/sheets",
  },
  {
    icon: FaBookmark,
    label: "04",
    title: "Bookmarks and notes",
    desc: "Save tricky questions and write the insight you want to remember next time.",
    href: "/bookmarks",
  },
  {
    icon: FaBookOpen,
    label: "05",
    title: "Practice in context",
    desc: "Open the original problem, explanation, and related questions without losing your place.",
    href: "/roadmap/arrays",
  },
  {
    icon: FaChartLine,
    label: "06",
    title: "Progress that responds",
    desc: "Your solved count, heatmap, streaks, and difficulty breakdown update as you practice.",
    href: "/dashboard",
  },
];

function Features() {
  return (
    <section className="landing-section landing-features" aria-labelledby="features-heading">
      <div className="landing-container">
        <div className="landing-section-heading">
          <div>
            <p className="landing-eyebrow">One focused workspace</p>
            <h2 id="features-heading">Everything you need to prepare with intent<span>.</span></h2>
          </div>
          <p>Less tab switching. More deliberate practice. Every feature is connected to the same learning path.</p>
        </div>

        <div className="landing-feature-grid">
          {features.map(({ icon: Icon, label, title, desc, href }) => (
            <Link key={title} to={href} className="landing-feature-card">
              <div className="landing-feature-card-top">
                <span className="landing-feature-icon"><Icon /></span>
                <span>{label}</span>
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="landing-card-link">Explore <FaArrowRight /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
