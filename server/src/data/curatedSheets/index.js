const sheets = [require("./love-babbar.json"), require("./striver-sde.json")];

function canonicalResource(value) {
  const url = new URL(value);
  let host = url.hostname.toLowerCase().replace(/^www\./, "");
  host = host.replace(/^practice\.geeksforgeeks\.org$/, "geeksforgeeks.org");
  let pathname = url.pathname.replace(/\/+$/, "");
  if (host === "leetcode.com") pathname = pathname.replace(/\/(description|solutions|submissions|discuss)$/, "");
  if (host === "geeksforgeeks.org" && pathname.startsWith("/problems/")) pathname = pathname.replace(/\/[01]$/, "");
  return `${host}${pathname}`;
}

function validateSheets(items = sheets) {
  const topics = new Set(require("../topics").map(topic => topic.slug));
  for (const sheet of items) {
    if (sheet.entries.length !== sheet.expectedCount) throw new Error(`Incomplete sheet: ${sheet.slug}`);
    const orders = new Set();
    sheet.entries.forEach((entry, index) => {
      if (entry.order !== index + 1 || orders.has(entry.order)) throw new Error(`Invalid source order: ${sheet.slug}`);
      orders.add(entry.order);
      if (!entry.title || !entry.section || !entry.questionSlug || !topics.has(entry.topic)) throw new Error(`Invalid entry: ${sheet.slug}/${entry.order}`);
      for (const value of [entry.resourceUrl, entry.sourceUrl, entry.leetcodeUrl, entry.gfgUrl].filter(Boolean)) {
        if (new URL(value).protocol !== "https:") throw new Error(`Non-HTTPS source: ${sheet.slug}/${entry.order}`);
      }
      if (!["Easy", "Medium", "Hard", "Unrated"].includes(entry.difficulty)) throw new Error("Unknown difficulty");
    });
  }
  return items;
}

// Reuse only exact catalog identities/URLs. Never infer question equivalence from
// similar names (e.g. subset enumeration and subset-sum decision are different).
function planQuestions(existing = [], items = sheets) {
  validateSheets(items);
  const bySlug = new Map(existing.map(question => [question.slug, question]));
  const byUrl = new Map();
  for (const question of existing) {
    for (const field of ["leetcodeUrl", "gfgUrl", "resourceUrl"]) {
      if (question[field]) byUrl.set(canonicalResource(question[field]), question);
    }
  }
  const created = new Map();
  const resolved = items.map(sheet => ({
    ...sheet,
    entries: sheet.entries.map(entry => {
      const key = canonicalResource(entry.resourceUrl);
      const current = bySlug.get(entry.questionSlug) || (entry.kind !== "concept" ? byUrl.get(key) : undefined);
      const questionSlug = current?.slug || entry.questionSlug;
      if (!current && !created.has(questionSlug)) {
        const question = {
          slug: questionSlug,
          title: entry.title,
          topic: entry.topic,
          difficulty: entry.difficulty,
          kind: entry.kind,
          leetcodeUrl: entry.leetcodeUrl || "",
          gfgUrl: entry.gfgUrl || "",
          resourceUrl: entry.resourceUrl,
          isActive: true,
        };
        created.set(questionSlug, question);
        bySlug.set(questionSlug, question);
        if (entry.kind !== "concept") byUrl.set(key, question);
      }
      return { ...entry, questionSlug };
    }),
  }));
  return { sheets: resolved, newQuestions: [...created.values()] };
}

module.exports = { sheets, canonicalResource, validateSheets, planQuestions };
