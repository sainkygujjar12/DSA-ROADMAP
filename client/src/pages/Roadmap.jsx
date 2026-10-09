import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowDown, FiArrowRight, FiBookOpen, FiCheck, FiGitBranch, FiLayers, FiRefreshCw, FiTrendingUp } from "react-icons/fi";
import MainLayout from "../components/layout/MainLayout";
import TopicIcon from "../components/common/TopicIcon";
import { useAuth } from "../context/AuthContext";
import { getDashboard } from "../services/dashboardService";
import { getSheets } from "../services/sheetService";
import { getTopics } from "../services/topicService";
import "./roadmap.css";

// A suggested learning order, with one node per real catalog topic. Each branch
// stays in its own lane so connectors never pass through another topic card.
const LEARNING_PATH = [
  { slug: "arrays", label: "Arrays", row: 1, col: 2 },
  { slug: "strings", label: "Strings", row: 2, col: 1, parent: "arrays" },
  { slug: "stack", label: "Stack", row: 2, col: 2, parent: "arrays" },
  { slug: "binary-search", label: "Binary Search", row: 2, col: 3, parent: "arrays" },
  { slug: "sliding-window", label: "Sliding Window", row: 3, col: 1, parent: "strings" },
  { slug: "linked-list", label: "Linked List", row: 3, col: 2, parent: "stack" },
  { slug: "trees", label: "Trees", row: 3, col: 3, parent: "binary-search" },
  { slug: "backtracking", label: "Backtracking", row: 4, col: 1, parent: "sliding-window" },
  { slug: "queue", label: "Queue", row: 4, col: 2, parent: "linked-list" },
  { slug: "bst", label: "Binary Search Trees", row: 4, col: 3, parent: "trees" },
  { slug: "dynamic-programming", label: "Dynamic Programming", row: 5, col: 1, parent: "backtracking" },
  { slug: "heap", label: "Heap & Priority Queue", row: 5, col: 2, parent: "queue" },
  { slug: "graph", label: "Graphs", row: 5, col: 3, parent: "bst" },
  { slug: "bit-manipulation", label: "Bit Manipulation", row: 6, col: 1, parent: "dynamic-programming" },
  { slug: "greedy", label: "Greedy", row: 6, col: 2, parent: "heap" },
  { slug: "trie", label: "Tries", row: 6, col: 3, parent: "graph" },
];

function roundedBranch(start, end) {
  if (Math.abs(start.x - end.x) < 1) return `M ${start.x} ${start.y} V ${end.y}`;
  const mid = (start.y + end.y) / 2;
  const direction = Math.sign(end.x - start.x);
  const radius = Math.min(14, (end.y - start.y) / 4, Math.abs(end.x - start.x) / 2);
  return `M ${start.x} ${start.y} V ${mid - radius} Q ${start.x} ${mid} ${start.x + direction * radius} ${mid} H ${end.x - direction * radius} Q ${end.x} ${mid} ${end.x} ${mid + radius} V ${end.y}`;
}

function Roadmap() {
  const { isAuthenticated } = useAuth();
  const [topics, setTopics] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const [connectors, setConnectors] = useState({ width: 1, height: 1, paths: [] });
  const mapRef = useRef(null);
  const nodeRefs = useRef(new Map());

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      getTopics(),
      isAuthenticated ? getDashboard() : Promise.resolve(null),
      getSheets(),
    ]).then(([topicResult, dashboardResult, sheetResult]) => {
      if (cancelled) return;
      if (topicResult.status === "fulfilled") {
        setTopics(topicResult.value?.data || []);
        setError("");
      } else {
        setTopics([]);
        setError("We couldn't load your roadmap. Please try again.");
      }
      setDashboard(dashboardResult.status === "fulfilled" ? dashboardResult.value?.data || null : null);
      setSheets(sheetResult.status === "fulfilled" ? sheetResult.value?.data || [] : []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [isAuthenticated, retry]);

  const topicMap = useMemo(() => new Map(topics.map((topic) => [topic.slug, topic])), [topics]);
  const nodes = useMemo(() => LEARNING_PATH.filter((node) => topicMap.has(node.slug)), [topicMap]);
  const otherTopics = topics.filter((topic) => !LEARNING_PATH.some((node) => node.slug === topic.slug));
  const activeSlug = hovered || focused;
  const activePath = useMemo(() => {
    const result = new Set();
    let node = LEARNING_PATH.find((item) => item.slug === activeSlug);
    while (node) {
      result.add(node.slug);
      node = LEARNING_PATH.find((item) => item.slug === node.parent);
    }
    return result;
  }, [activeSlug]);

  useLayoutEffect(() => {
    if (loading || !mapRef.current) return undefined;
    const map = mapRef.current;
    let frame;
    const update = () => {
      const mapRect = map.getBoundingClientRect();
      const paths = nodes.flatMap((node) => {
        const from = nodeRefs.current.get(node.parent);
        const to = nodeRefs.current.get(node.slug);
        if (!from || !to) return [];
        const start = from.getBoundingClientRect();
        const end = to.getBoundingClientRect();
        return [{
          slug: node.slug,
          d: roundedBranch(
            { x: start.left - mapRect.left + start.width / 2, y: start.bottom - mapRect.top },
            { x: end.left - mapRect.left + end.width / 2, y: end.top - mapRect.top },
          ),
        }];
      });
      setConnectors({ width: mapRect.width, height: mapRect.height, paths });
    };
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(map);
    nodeRefs.current.forEach((element) => observer.observe(element));
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [loading, nodes]);

  const total = topics.reduce((sum, topic) => sum + (topic.totalQuestions || 0), 0);
  const solved = topics.reduce((sum, topic) => sum + Math.min(topic.solvedQuestions || 0, topic.totalQuestions || 0), 0);
  const percentage = total ? Math.round(solved / total * 100) : 0;
  const started = topics.filter((topic) => topic.solvedQuestions > 0).length;
  const featuredSheets = [...sheets].sort((a, b) => {
    const priority = ["love-babbar-sheet", "striver-sde-sheet", "neetcode-150"];
    const rank = (slug) => priority.includes(slug) ? priority.indexOf(slug) : priority.length;
    return rank(a.slug) - rank(b.slug);
  }).slice(0, 3);

  return (
    <MainLayout>
      <div className="learning-roadmap">
        <header className="learning-heading">
          <div>
            <span className="page-kicker"><FiGitBranch /> YOUR LEARNING PATH</span>
            <h1>Small steps. <span>Stronger foundations.</span></h1>
            <p>A suggested path through DSA. Follow a branch, or choose any topic to begin.</p>
          </div>
          <span className="learning-total"><FiBookOpen /> {total.toLocaleString()} questions</span>
        </header>

        <div className="learning-workspace">
          <section className="learning-canvas" aria-label="DSA learning roadmap">
            <div className="learning-map-toolbar">
              <span><i /> Explore the roadmap</span>
              <small className="learning-desktop-hint">Hover or focus a topic to trace its path</small>
              <small className="learning-mobile-hint">Your path, one topic at a time</small>
            </div>

            {loading ? (
              <div className="learning-state" role="status"><span className="ui-loader-spinner" /> Loading your learning path…</div>
            ) : error ? (
              <div className="learning-state" role="alert">
                <p>{error}</p>
                <button type="button" onClick={() => { setLoading(true); setRetry((value) => value + 1); }}><FiRefreshCw /> Try again</button>
              </div>
            ) : topics.length === 0 ? (
              <div className="learning-state"><FiBookOpen /><p>Your learning path will appear when topics are available.</p></div>
            ) : (
              <>
                <div className="learning-map" ref={mapRef}>
                  <svg className="learning-connectors" viewBox={`0 0 ${connectors.width} ${connectors.height}`} aria-hidden="true">
                    {connectors.paths.map((path) => (
                      <g key={path.slug} className={activePath.has(path.slug) ? "is-active" : ""}>
                        <path d={path.d} className="learning-connector-base" />
                        {activePath.has(path.slug) && <path d={path.d} className="learning-connector-flow" />}
                      </g>
                    ))}
                  </svg>
                  <div className="learning-grid">
                    {nodes.map((node, index) => {
                      const topic = topicMap.get(node.slug);
                      const count = Math.min(topic.solvedQuestions || 0, topic.totalQuestions || 0);
                      const progress = topic.totalQuestions ? Math.round(count / topic.totalQuestions * 100) : 0;
                      const complete = topic.totalQuestions > 0 && count === topic.totalQuestions;
                      return (
                        <Link
                          key={node.slug}
                          ref={(element) => {
                            if (element) nodeRefs.current.set(node.slug, element);
                            else nodeRefs.current.delete(node.slug);
                          }}
                          to={`/roadmap/${node.slug}`}
                          className={`learning-node ${!node.parent ? "is-root" : ""} ${complete ? "is-complete" : ""} ${activePath.has(node.slug) ? "is-on-path" : ""}`}
                          style={{ "--node-row": node.row, "--node-column": node.col, "--node-delay": `${index * 28}ms` }}
                          onMouseEnter={() => setHovered(node.slug)}
                          onMouseLeave={() => setHovered(null)}
                          onFocus={() => setFocused(node.slug)}
                          onBlur={() => setFocused(null)}
                          aria-label={`${node.label}: ${count} of ${topic.totalQuestions || 0} questions solved`}
                        >
                          <div className="learning-node-top"><span><TopicIcon slug={node.slug} size={17} />{!node.parent ? "START HERE" : `STEP ${String(node.row).padStart(2, "0")}`}</span>{complete ? <FiCheck /> : <FiArrowRight />}</div>
                          <h2>{node.label}</h2>
                          <div className="learning-node-bottom"><span>{count}<span> / {topic.totalQuestions || 0} solved</span></span><small>{progress}%</small></div>
                          <span className="learning-node-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <div className="learning-map-footer"><FiArrowDown /><span>Progress at your own pace. Every solved question counts.</span></div>
                {otherTopics.length > 0 && (
                  <div className="learning-more">
                    <h2>Keep exploring</h2>
                    <p>Extend your toolkit with more topics.</p>
                    <div>{otherTopics.map((topic) => <Link key={topic.slug} to={`/roadmap/${topic.slug}`}>{topic.name}<FiArrowRight /></Link>)}</div>
                  </div>
                )}
              </>
            )}
          </section>

          <aside className="learning-sidebar">
            <section className="learning-summary">
              <div className="learning-sidebar-heading"><FiTrendingUp /><h2>Your progress</h2></div>
              <div className="learning-ring" style={{ "--progress-angle": `${percentage * 3.6}deg` }} aria-label={`${percentage}% complete`}>
                <div><strong>{percentage}<span>%</span></strong><small>complete</small></div>
              </div>
              <p><strong>{solved.toLocaleString()}</strong> of {total.toLocaleString()} questions solved</p>
              <div className="learning-summary-stats"><span>Topics started<strong>{started}<small> / {topics.length}</small></strong></span><span>Current streak<strong>{dashboard?.stats?.streak || 0}<small> days</small></strong></span></div>
              {!isAuthenticated && <Link className="learning-sign-in" to="/login">Sign in to save your progress <FiArrowRight /></Link>}
            </section>

            <section className="learning-sheets">
              <div className="learning-sidebar-heading"><FiLayers /><h2>Practice with a sheet</h2></div>
              <p>Prefer a curated checklist? Pick a collection and build a daily habit.</p>
              <div>{featuredSheets.map((sheet) => <Link key={sheet.slug} to={`/sheets/${sheet.slug}`}><span className="learning-sheet-icon"><FiBookOpen /></span><span><strong>{sheet.name}</strong><small>{sheet.totalQuestions || 0} questions</small></span><FiArrowRight /></Link>)}</div>
              <Link className="learning-all-sheets" to="/sheets">Explore all sheets <FiArrowRight /></Link>
            </section>

            <div className="learning-tip"><FiGitBranch /><p><strong>Consistency over speed.</strong> Solve a few questions, revisit the difficult ones, and let your progress add up.</p></div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}

export default Roadmap;
