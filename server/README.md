# DSA_ROADMAP

## Add the interview practice expansion

Run `npm run seed:expansion` from `server/` using the configured `MONGO_URI`.
This additive, repeatable import adds 120 public LeetCode problems and four
companies (Salesforce, Oracle, Atlassian, and LinkedIn), retaining existing
question IDs, company links, and user progress. Each new company receives the
120-problem practice collection; these are curated recommendations, not
verified company interview tags.

Problem titles, IDs, difficulties, and free availability were checked against
LeetCode's public catalog at https://leetcode.com/api/problems/all/ on 2026-10-07.
The expansion is also included in the normal question data discovery.

## Company repository import

Run `npm run seed:companies` to add all 103 company entries extracted from
https://github.com/xizhang20181005/Leetcode_company_frequency at commit
`35f560716d26692661381339460d80ec45c1734b`. This is a historical 2019 snapshot,
not current interview frequency data. Facebook maps to Meta; time-window and
all-time PDF variants are merged. Quip (Salesforce) remains a separate entry.

The import adds the complete remaining question catalog from
`src/data/questions/companyRepositoryExpansion.js` and
`src/data/questions/companyRepositoryRemaining.js`, covering all 1,133
unique company-list questions and 5,280 company-question relationships.
Eleven historical URLs are normalized using `leetcodeSlugAliases.json`;
four already exist under their current names and are reused without duplicates.
Titles, difficulty, topics, and Premium availability were checked against
LeetCode's public metadata on 2026-10-07. Premium questions are included and
labeled; SQL, shell, math, design, and concurrency have dedicated categories.
The importer fails if any source question is unmatched.
Existing company details, question IDs, links, and user progress are preserved.
Rerunning is safe and adds no duplicate companies or relationships.

`src/data/companyRepository.json` retains the complete extracted slug lists
and source filenames. Regenerate with
`python scripts/extractCompanyRepository.py source.zip output.json` (requires
`pypdf`). Use the ZIP archive pinned to the commit above; the output is ready
to replace `src/data/companyRepository.json`.
The regular company/question seeds also include these company mappings.
