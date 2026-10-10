// Adapted from Aceternity UI's free Bento Grid; theme tokens and router links
// replace its fixed colors and non-interactive demo containers.
// https://ui.aceternity.com/components/bento-grid
import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";

export function BentoGrid({ children }) {
  return <div className="bento-grid">{children}</div>;
}

export function BentoGridItem({ title, description, header, icon, to, wide = false, label }) {
  return <Link to={to} className={`bento-card ${wide ? "bento-wide" : ""}`}>
    <div className="bento-card-top"><span>{icon}{label}</span><FiArrowUpRight aria-hidden="true" /></div>
    <div className="bento-card-preview" aria-hidden="true">{header}</div>
    <div className="bento-card-copy"><h3>{title}</h3><p>{description}</p></div>
  </Link>;
}
