import { FaArrowUp } from "react-icons/fa";
import { Link } from "react-router-dom";
import Logo from "../common/Logo";
import CreatorCredit from "../common/CreatorCredit";

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer-main">
          <div>
            <Logo className="footer-brand" />
            <p>Master data structures and algorithms with a roadmap that keeps your next step obvious.</p>
          </div>
          <div className="landing-footer-links">
            <div>
              <strong>Explore</strong>
              <Link to="/roadmap">Roadmap</Link>
              <Link to="/companies">Companies</Link>
              <Link to="/sheets">Sheets</Link>
            </div>
            <div>
              <strong>Account</strong>
              <Link to="/login">Log in</Link>
              <Link to="/register">Get started</Link>
              <Link to="/dashboard">Dashboard</Link>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>© 2026 DSA Roadmap. Built for consistent practice.</span>
          <CreatorCredit />
          <div className="landing-socials">
            <a href="#top" aria-label="Back to top"><FaArrowUp /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
