import "./TopicIcon.css";

// The same 24px drawing grid keeps every topic recognizable at card and menu sizes.
const drawings = {
  arrays: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M9 6v12m6-12v12M5.5 10v4m6.5-4v4m6.5-4v4" /></>,
  strings: <><path d="M5 5H3v14h2m14-14h2v14h-2M7 16l5-9 5 9m-8-3h6" /></>,
  "linked-list": <><rect x="2" y="8" width="5" height="8" rx="2" /><rect x="17" y="8" width="5" height="8" rx="2" /><path d="M7 12h10m-4-3 3 3-3 3" /></>,
  stack: <><path d="m3 7 9-4 9 4-9 4-9-4Zm0 5 9 4 9-4M3 17l9 4 9-4" /></>,
  queue: <><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M12 7v10M2 12h5m10 0h5m-3-3 3 3-3 3" /></>,
  "binary-search": <><path d="M3 5h18M7 3v4m5-4v4m5-4v4M16 17l4 4" /><circle cx="11" cy="14" r="5" /></>,
  trees: <><rect x="9" y="2" width="6" height="5" rx="1.5" /><rect x="2" y="16" width="6" height="5" rx="1.5" /><rect x="16" y="16" width="6" height="5" rx="1.5" /><path d="M12 7v4H5v5m7-5h7v5" /></>,
  bst: <><circle cx="12" cy="5" r="3" /><circle cx="5" cy="18" r="3" /><circle cx="19" cy="18" r="3" /><path d="m10.5 8-4 7m7-7 4 7M9 18h6m-3-2-2 2 2 2" /></>,
  heap: <><path d="m12 3 9 17H3L12 3Z" /><path d="M8 12h8m-11 4h14m-7-4v8" /></>,
  trie: <><path d="M12 6v5H4v6m8-6v6m0-6h8v6" /><circle cx="12" cy="4" r="2" /><circle cx="4" cy="19" r="2" /><circle cx="12" cy="19" r="2" /><circle cx="20" cy="19" r="2" /></>,
  graph: <><path d="m6 6 12 1M5 8l1 10m3 2 10-8M8 7l11 3M8 18l9-9" /><circle cx="4" cy="5" r="2.5" /><circle cx="20" cy="8" r="2.5" /><circle cx="6" cy="21" r="2" /></>,
  "dynamic-programming": <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 17.5h7m-3.5-3.5v7M10 6.5h4M6.5 10v4" /></>,
  greedy: <><path d="m4 18 6-6 4 3 6-10m-6 0h6v6" /><path d="M4 6h4M6 4v4" /></>,
  backtracking: <><path d="M8 5H4v4m0-4 6 6h7a4 4 0 0 1 0 8h-6m3-3-3 3 3 3M10 11v5" /></>,
  "sliding-window": <><rect x="2" y="7" width="20" height="10" rx="2" /><rect x="7" y="4" width="10" height="16" rx="2" /><path d="M12 8v8" /></>,
  "bit-manipulation": <><rect x="3" y="4" width="6" height="7" rx="2" /><path d="m15 5 3-1v7m-3 0h6M5 15l2-1v7m-3 0h6" /><rect x="15" y="14" width="6" height="7" rx="2" /></>,
  math: <><path d="M3 20 20 3v17H3Zm10-1v-6h6M3 5h5M5.5 2.5v5" /></>,
  design: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><path d="M14 3h7v7M3 14v7h7m-3.5-7v3.5H14m3.5-7V6.5H10" /></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" /></>,
  shell: <><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m6 9 3 3-3 3m7 0h5" /></>,
  concurrency: <><path d="M6 3v18m12-18v18m-6-14 3 3-3 3M6 10h9M12 14l-3 3 3 3m-3-3h9" /></>,
};

export default function TopicIcon({ slug, className = "", size = 24 }) {
  const key = Object.hasOwn(drawings, slug) ? slug : "design";
  return <span className={`topic-icon topic-icon-${key} ${className}`} aria-hidden="true">
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" focusable="false">{drawings[key]}</svg>
  </span>;
}
