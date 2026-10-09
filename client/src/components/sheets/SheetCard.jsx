import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { FiBookOpen, FiCode, FiLayers, FiTarget, FiZap } from "react-icons/fi";

const SHEET_META = {
  "blind-75": { icon: FiTarget, color: "#15c39a" },
  "neetcode-150": { icon: FiCode, color: "#f59e0b" },
  "neetcode-250": { icon: FiCode, color: "#fb3b76" },
  "love-babbar-sheet": { icon: FiBookOpen, color: "#8b5cf6" },
  "striver-sde-sheet": { icon: FiLayers, color: "#13b8df" },
  "grind-169": { icon: FiZap, color: "#13b8df" },
};

function SheetCard({ sheet }) {
  const meta = SHEET_META[sheet.slug] || { icon: FiBookOpen, color: "#10c88d" };
  const Icon = meta.icon;

  return (
    <article
      className="sheet-library-card"
      style={{ "--sheet-accent": meta.color }}
    >
      <div className="sheet-card-top">
        <span className="sheet-card-icon"><Icon aria-hidden="true" /></span>
        <span className="sheet-card-count">{sheet.totalQuestions || 0} questions</span>
      </div>
      <h2>{sheet.name}</h2>
      <p className="sheet-card-author">{sheet.author || "Curated by DSA Roadmap"}</p>
      <p className="sheet-card-description">
        {sheet.description || "A focused set of problems to build reliable interview patterns."}
      </p>
      <div className="sheet-card-footer">
        <span className="sheet-card-section-count">{sheet.sectionCount ? `${sheet.sectionCount} sections` : "Practice at your pace"}</span>
        <Link to={`/sheets/${sheet.slug}`}>
          Open sheet <FaArrowRight />
        </Link>
      </div>
    </article>
  );
}

export default SheetCard;
