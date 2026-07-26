import {
  FaCode,
  FaBookOpen,
  FaChartLine,
  FaBuilding,
  FaClipboardList,
  FaBookmark,
} from "react-icons/fa";

const features = [
  {
    icon: <FaCode />,
    title: "Topic-wise Roadmap",
    desc: "Master every DSA topic in the correct order.",
  },
  {
    icon: <FaBuilding />,
    title: "Company Questions",
    desc: "Google, Amazon, Microsoft, Uber & many more.",
  },
  {
    icon: <FaClipboardList />,
    title: "Curated Sheets",
    desc: "Blind 75, Striver SDE, NeetCode & more.",
  },
  {
    icon: <FaBookmark />,
    title: "Bookmarks",
    desc: "Save important problems for revision.",
  },
  {
    icon: <FaBookOpen />,
    title: "Personal Notes",
    desc: "Write notes for every problem.",
  },
  {
    icon: <FaChartLine />,
    title: "Progress Tracking",
    desc: "Visualize your learning journey.",
  },
];

function Features() {
  return (
    <section className="bg-slate-950 py-24">

      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <h2 className="text-4xl font-bold">
            Everything You Need
          </h2>

          <p className="mt-4 text-slate-400">
            A complete platform for interview preparation.
          </p>

        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-8 transition hover:-translate-y-2 hover:border-cyan-500"
            >

              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 text-3xl">

                {feature.icon}

              </div>

              <h3 className="text-2xl font-bold">
                {feature.title}
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                {feature.desc}
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}

export default Features;