import { FiArrowRight, FiBookOpen, FiBriefcase, FiCheck, FiLayers, FiTrendingUp } from "react-icons/fi";
import { BentoGrid, BentoGridItem } from "../ui/BentoGrid";
import CompanyIcon from "../ui/CompanyIcon";

export default function Features({ roadmap }) {
  const preview = ['arrays', 'strings', 'binary-search'].map(slug => roadmap.topics.find(topic => topic.slug === slug)).filter(Boolean);
  return <section className="landing-section landing-features" aria-labelledby="features-heading">
    <div className="landing-container">
      <div className="landing-section-heading">
        <div><p className="landing-eyebrow">Built around your practice</p><h2 id="features-heading">A place for every step<span>.</span></h2></div>
        <p>Find your next problem, work through it, and keep what you learn. Everything stays connected.</p>
      </div>
      <BentoGrid>
        <BentoGridItem wide label="01 / The foundations" icon={<FiLayers />} to="/roadmap"
          title="Know what comes next." description="A topic-by-topic path from your first array to dynamic programming. Pick up at your own pace."
          header={<div className="bento-path">{preview.length ? preview.map((topic, index) => <div key={topic.slug}><span>{String(index + 1).padStart(2, '0')}</span><strong>{topic.name}</strong><FiArrowRight /></div>) : <p>Arrays · Strings · Binary search</p>}</div>} />
        <BentoGridItem label="02 / Your next interview" icon={<FiBriefcase />} to="/companies"
          title="Prepare with a destination." description="Explore company-tagged questions and the patterns behind them."
          header={<div className="bento-company-marks">{['Google', 'Amazon', 'Microsoft', 'Apple'].map(name => <CompanyIcon key={name} company={{ name }} size="md" />)}</div>} />
        <BentoGridItem label="03 / A focused plan" icon={<FiBookOpen />} to="/sheets"
          title="Follow a proven collection." description="Work through Love Babbar, Striver SDE, and curated interview sheets, section by section."
          header={<div className="bento-sheets"><span><FiBookOpen />Love Babbar</span><span><FiLayers />Striver SDE</span></div>} />
        <BentoGridItem wide label="04 / Your learning loop" icon={<FiTrendingUp />} to="/dashboard"
          title="Make the practice count." description="Track solved questions, revisit your bookmarks, and save the insight that makes a hard problem click."
          header={<div className="bento-learning-loop">{['Solve a problem', 'Capture the insight', 'Come back stronger'].map((step, index) => <div key={step}><span>{index === 0 ? <FiCheck /> : String(index + 1).padStart(2, '0')}</span><strong>{step}</strong></div>)}</div>} />
      </BentoGrid>
    </div>
  </section>;
}
