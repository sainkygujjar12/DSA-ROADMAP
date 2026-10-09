import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import CompanyIcon from "../ui/CompanyIcon";
import { getCompanies } from "../../services/companyService";

function Companies() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    let cancelled = false;

    getCompanies()
      .then((response) => {
        if (!cancelled) setCompanies(response?.data || []);
      })
      .catch((error) => console.error("Landing companies error:", error));

    return () => {
      cancelled = true;
    };
  }, []);

  if (!companies.length) return null;

  const track = [...companies, ...companies];

  return (
    <section className="landing-company-flow" aria-labelledby="company-flow-heading">
      <div className="landing-container">
        <div className="landing-section-heading">
          <div>
            <p className="landing-eyebrow">Company-tagged practice</p>
            <h2 id="company-flow-heading">Prepare for the companies you want<span>.</span></h2>
          </div>
          <Link to="/companies" className="landing-outline-button landing-company-link">View all companies</Link>
        </div>
      </div>

      <div className="company-flow-mask">
        <div
          className="company-flow-track animate-marquee"
          style={{ animationDuration: `${Math.max(60, companies.length * 5)}s` }}
        >
          {track.map((company, index) => (
            <Link
              key={`${company._id}-${index}`}
              to={`/companies/${company.slug}`}
              className="company-flow-card"
            >
              <CompanyIcon company={company} size="md" />
              <span className="company-flow-card-copy">
                <strong>{company.name}</strong>
                <small>{company.totalQuestions || 0} questions</small>
              </span>
              <span className="company-flow-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Companies;
