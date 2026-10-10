import HoverGrid from "../components/ui/HoverGrid";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/ui/Loader";
import CompanyIcon from "../components/ui/CompanyIcon";
import Pagination from "../components/ui/Pagination";

import { getCompanies } from "../services/companyService";

function Companies() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(search.trim().toLowerCase())
  );
  const pageSize = 24;
  const visibleCompanies = filteredCompanies.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await getCompanies();

        setCompanies(response?.data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="max-w-2xl">
          <p className="eyebrow-label">Company patterns</p>
          <h1 className="display-heading text-5xl font-extrabold text-white sm:text-6xl">
            Practice by company<span className="text-[#7c72ff]">.</span>
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-400">
            Explore company question lists and curated interview practice.
          </p>
        </div>

        {/* Empty State */}
        <div className="space-y-3">
          <label htmlFor="company-search" className="block text-sm text-slate-400">Search companies</label>
          <input
            id="company-search"
            type="search"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Search by company name…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white"
          />
          <p className="text-sm text-slate-400" aria-live="polite">{filteredCompanies.length} of {companies.length} companies</p>
        </div>
        {filteredCompanies.length === 0 ? (
          <div className="theme-surface rounded-2xl border border-white/10 bg-[#242427] p-10 text-center text-slate-400">
            No companies found.
          </div>
        ) : (
          <HoverGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleCompanies.map((company) => (
              <Link
                key={company._id}
                to={`/companies/${company.slug}`}
                className="theme-surface group rounded-2xl border border-white/10 bg-[#242427] p-5 transition hover:-translate-y-1 hover:border-[#665cff]/70 hover:bg-[#2a2a2e] hover:shadow-xl hover:shadow-black/20"
              >
                <div className="flex items-center gap-4">
                  <CompanyIcon company={company} />
                  <h2 className="text-lg font-bold text-white">{company.name}</h2>
                </div>

                <p className="mt-5 font-mono text-xs text-slate-500">
                  {company.totalQuestions || 0} Questions
                </p>
                {company.description && (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                    {company.description}
                  </p>
                )}
                <div className="mt-6 flex items-center justify-between text-sm font-semibold text-[#00c99a]">
                  <span>Practice</span>
                  <span className="transition group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </HoverGrid>
        )}
        <Pagination currentPage={page} totalPages={Math.ceil(filteredCompanies.length / pageSize)} onPageChange={setPage} />

      </div>
    </MainLayout>
  );
}

export default Companies;
