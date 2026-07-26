import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/ui/Loader";
import CompanyIcon from "../components/ui/CompanyIcon";

import { getCompanies } from "../services/companyService";

function Companies() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);

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

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">
            🏢 Companies
          </h1>

          <p className="mt-2 text-slate-400">
            Practice company-specific interview questions.
          </p>
        </div>

        {/* Empty State */}
        {companies.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            No companies found.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {companies.map((company) => (
              <Link
                key={company._id}
                to={`/companies/${company.slug}`}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-500 hover:shadow-lg"
              >

                {/* Header */}
                <div className="flex items-center gap-4">

                  <CompanyIcon company={company} />

                  <h2 className="text-xl font-bold">
                    {company.name}
                  </h2>

                </div>

                {/* Questions */}
                <p className="mt-4 text-slate-400">
                  {company.totalQuestions || 0} Questions
                </p>

                {/* Description */}
                {company.description && (
                  <p className="mt-3 text-sm text-slate-500">
                    {company.description}
                  </p>
                )}

                {/* CTA */}
                <div className="mt-6 font-medium text-cyan-500">
                  Practice →
                </div>

              </Link>
            ))}

          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default Companies;