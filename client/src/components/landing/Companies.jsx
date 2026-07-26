import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import CompanyIcon from "../ui/CompanyIcon";
import { getCompanies } from "../../services/companyService";

function Companies() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    getCompanies()
      .then((res) => setCompanies(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  if (companies.length === 0) return null;

  // Duplicate the list so the CSS animation can loop
  // seamlessly from -50% back to 0%.
  const track = [...companies, ...companies];

  return (
    <section className="bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-6">

        <h2 className="text-center text-4xl font-bold text-white">
          Prepare for Top Companies
        </h2>

        <p className="mt-4 text-center text-slate-400">
          Company-tagged questions pulled straight from real
          interview experiences.
        </p>

      </div>

      {/* Flowing logo strip */}
      <div className="marquee-pause relative mt-14 overflow-hidden">

        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-slate-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-slate-950 to-transparent" />

        <div className="flex w-max animate-marquee gap-6">
          {track.map((company, i) => (
            <Link
              key={`${company._id}-${i}`}
              to={`/companies/${company.slug}`}
              className="flex w-64 shrink-0 items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-500"
            >
              <CompanyIcon company={company} size="md" />

              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-white">
                  {company.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {company.totalQuestions || 0} questions
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Companies;
