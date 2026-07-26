import { Link } from "react-router-dom";

function CTA() {
  return (
    <section className="bg-slate-950 py-28">

      <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-cyan-600 to-teal-600 px-10 py-20 text-center">

        <h2 className="text-5xl font-bold text-white">
          Ready to Crack Your Dream Company?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-cyan-100">
          Start your DSA journey with curated questions,
          company tags and interview sheets.
        </p>

        <Link
          to="/register"
          className="mt-10 inline-block rounded-xl bg-white px-8 py-4 font-semibold text-slate-900 transition hover:scale-105"
        >
          Start Learning
        </Link>

      </div>

    </section>
  );
}

export default CTA;