import {
  SiGoogle,
  SiMeta,
  SiApple,
  SiNetflix,
  SiUber,
  SiGoldmansachs,
} from "react-icons/si";

// Simple Icons has delisted several strict-trademark brand
// marks (Amazon, Microsoft, Adobe, Flipkart among them), so
// those fall back to a clean colored monogram instead —
// same pattern apps like Slack/Linear use for missing logos.
const BRAND_ICONS = {
  google: SiGoogle,
  meta: SiMeta,
  apple: SiApple,
  netflix: SiNetflix,
  uber: SiUber,
  "goldman-sachs": SiGoldmansachs,
};

function CompanyIcon({ company, size = "md" }) {
  const Icon = BRAND_ICONS[company?.slug];
  const color = company?.color || "#06b6d4";

  const sizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-11 w-11 text-lg",
    lg: "h-16 w-16 text-2xl",
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 30,
  };

  if (Icon) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl ${sizes[size]}`}
        style={{ backgroundColor: `${color}1a` }}
      >
        <Icon size={iconSizes[size]} color={color} />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl font-bold text-white ${sizes[size]}`}
      style={{ backgroundColor: color }}
    >
      {company?.name?.charAt(0) || "?"}
    </div>
  );
}

export default CompanyIcon;
