import {
  FaArrowRight,
  FaLayerGroup,
} from "react-icons/fa";

const topics = [
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Binary Tree",
  "BST",
  "Heap",
  "Graph",
  "Trie",
  "Backtracking",
  "Dynamic Programming",
];

function RoadmapPreview() {
  return (
    <section className="bg-slate-950 py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">
            Interactive DSA Roadmap
          </h2>

          <p className="mt-4 text-slate-400">
            Learn topic by topic with a structured path.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          {topics.map((topic) => (
            <div
              key={topic}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-2 hover:border-cyan-500"
            >
              <FaLayerGroup className="text-3xl text-cyan-500" />

              <h3 className="mt-5 text-xl font-bold">
                {topic}
              </h3>

              <button className="mt-6 flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
                Explore <FaArrowRight />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default RoadmapPreview;