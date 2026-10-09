import { Link } from "react-router-dom";
import { FaRocket } from "react-icons/fa";

function Logo({ className = "" }) {
  return (
    <Link
      to="/"
      className={`brand-logo ${className}`.trim()}
    >
      <span className="brand-logo-mark" aria-hidden="true">
        <FaRocket />
      </span>
      <span>DSA Roadmap</span>
    </Link>
  );
}

export default Logo;
