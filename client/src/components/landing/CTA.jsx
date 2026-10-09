import { FaArrowRight, FaRocket } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

function CTA() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="landing-cta-section">
      <div className="landing-container">
        <div className="landing-cta">
          <div className="landing-cta-glow" />
          <span className="landing-cta-icon"><FaRocket /></span>
          <p className="landing-eyebrow">Your next breakthrough is one session away</p>
          <h2>Turn preparation into momentum<span>.</span></h2>
          <p className="landing-cta-copy">Choose a topic, solve one problem, and let the roadmap keep the bigger picture clear.</p>
          <Link to={isAuthenticated ? "/dashboard" : "/register"} className="landing-primary-button">{isAuthenticated ? "Continue learning" : "Start preparing"} <FaArrowRight /></Link>
        </div>
      </div>
    </section>
  );
}

export default CTA;
