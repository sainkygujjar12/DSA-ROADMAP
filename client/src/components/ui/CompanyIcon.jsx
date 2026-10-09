import { useState } from "react";
import { FaBuilding } from "react-icons/fa";
import logos from "../../data/companyLogos.json";

const sizes = { sm: "h-8 w-8", md: "h-11 w-11", lg: "h-16 w-16" };

function CompanyIcon({ company, size = "md" }) {
  const [failedSources, setFailedSources] = useState([]);
  // Some populated API responses include a name but omit the slug.
  const nameSlug = company?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const slug = company?.slug || nameSlug;
  const bundledLogo = logos[slug];
  const src = [bundledLogo, company?.logo].find(url => url && !failedSources.includes(url));

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-white p-1.5 shadow-sm ${sizes[size] || sizes.md}`}
      title={company?.name}
      role="img"
      aria-label={`${company?.name || "Company"} logo`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedSources(previous => [...previous, src])}
          className="h-full w-full object-contain"
        />
      ) : (
        <FaBuilding className="h-3/5 w-3/5 text-slate-500" aria-hidden="true" />
      )}
    </span>
  );
}

export default CompanyIcon;
