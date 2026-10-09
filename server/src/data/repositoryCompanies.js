const source = require("./companyRepository.json");

module.exports = source.companies.map(({ name, slug, files }) => ({
  name,
  slug,
  description: "Practice questions matched to the repository's historical company lists.",
  sourceUrl: `${source.repository}/blob/${source.commit}/${encodeURIComponent(files[0])}`,
  sourceNote: `Company tags from a ${source.snapshotYear} snapshot. Lists may also include previously curated practice questions.`,
}));
