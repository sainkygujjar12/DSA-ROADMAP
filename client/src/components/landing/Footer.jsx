import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">

      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-10 md:grid-cols-2">

          <div>

            <h2 className="text-2xl font-bold">
              DSA Roadmap
            </h2>

            <p className="mt-4 text-slate-400">
              Master Data Structures &
              Algorithms with a modern roadmap.
            </p>

          </div>

          <div>

            <h3 className="mb-4 text-xl font-semibold">
              Resources
            </h3>

            <div className="space-y-3">

              <Link
                to="/roadmap"
                className="block text-slate-400 hover:text-white"
              >
                Roadmap
              </Link>

              <Link
                to="/companies"
                className="block text-slate-400 hover:text-white"
              >
                Companies
              </Link>

              <Link
                to="/sheets"
                className="block text-slate-400 hover:text-white"
              >
                Sheets
              </Link>

            </div>

          </div>

        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-slate-500">

          © 2026 DSA Roadmap. All rights reserved.

        </div>

      </div>

    </footer>
  );
}

export default Footer;