import { Link } from "react-router-dom";
import { FaArrowLeft, FaCode } from "react-icons/fa";

function AuthShell({ eyebrow, title, description, children }) {
  return (
    <main className="auth-shell flex min-h-screen items-center justify-center px-4 py-8 text-white sm:px-6">
      <div className="auth-frame grid w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-[#202023]/70 shadow-2xl shadow-black/30 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden p-10 lg:block xl:p-14">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#665cff]/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[#00c99a]/10 blur-3xl" />

          <Link to="/" className="relative flex items-center gap-3 text-xl font-bold">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#6f63ff] to-[#00c99a]">
              <FaCode />
            </span>
            DSA Roadmap
          </Link>

          <div className="relative mt-28 max-w-md">
            <p className="font-mono text-sm tracking-wide text-[#00c99a]">
              LEARN · PRACTICE · CRACK
            </p>
            <h2 className="display-heading mt-5 text-6xl font-extrabold text-white xl:text-7xl">
              Prepare with purpose.
            </h2>
            <p className="mt-7 text-lg leading-8 text-slate-400">
              A clean roadmap, the right patterns, and progress you can see.
            </p>
          </div>

          <div className="relative mt-20 grid grid-cols-2 gap-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="text-2xl text-[#00c99a]">✓</span>
              <p className="mt-3">Curated questions</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <span className="text-2xl text-[#7c72ff]">↗</span>
              <p className="mt-3">Track your growth</p>
            </div>
          </div>
        </section>

        <section className="auth-card p-6 sm:p-10 lg:p-14">
          <Link
            to="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white lg:hidden"
          >
            <FaArrowLeft /> Back home
          </Link>

          <div className="mx-auto max-w-md">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#00c99a]">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-3 leading-7 text-slate-400">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthShell;
