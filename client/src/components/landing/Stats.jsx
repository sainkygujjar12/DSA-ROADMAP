import { useEffect, useState } from "react";
import { FaArrowUp, FaBolt, FaBuilding, FaCode, FaLayerGroup } from "react-icons/fa";
import { getStats } from "../../services/statsService";

function Stats() {
  const [stats, setStats] = useState([
    { number: "—", title: "Questions", icon: FaCode },
    { number: "—", title: "Companies", icon: FaBuilding },
    { number: "—", title: "Topics", icon: FaLayerGroup },
    { number: "—", title: "Sheets", icon: FaBolt },
  ]);

  useEffect(() => {
    getStats()
      .then((res) => {
        const data = res.data;
        setStats([
          { number: `${data.totalQuestions}+`, title: "Questions", icon: FaCode },
          { number: `${data.totalCompanies}+`, title: "Companies", icon: FaBuilding },
          { number: `${data.totalTopics}+`, title: "Topics", icon: FaLayerGroup },
          { number: `${data.totalSheets}+`, title: "Sheets", icon: FaBolt },
        ]);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="landing-metrics" aria-label="Platform statistics">
      <div className="landing-container">
        <div className="landing-metrics-heading">
          <div>
            <p className="landing-eyebrow">Built to compound</p>
            <h2>Small sessions. Measurable progress<span>.</span></h2>
          </div>
          <FaArrowUp aria-hidden="true" />
        </div>
        <div className="landing-metrics-grid">
          {stats.map(({ number, title, icon: Icon }) => (
            <div key={title} className="landing-metric-card">
              <Icon />
              <strong>{number}</strong>
              <span>{title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
