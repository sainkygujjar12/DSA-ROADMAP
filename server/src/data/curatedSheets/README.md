# Complete curated sheets

This folder contains ordered metadata and links, not copied solutions.

- **Love Babbar DSA450:** all 448 populated question rows in the [original workbook](https://drive.google.com/file/d/1FMdN_OCfOI0iAeDlqswCiC2DZzD4nPsb/view), across 15 sections. The workbook's commonly used name is “450”; its actual row count is preserved. `sourceRevision` is the workbook SHA-256. Three conceptual prompts and repeated source rows are included.
- **Striver SDE:** the classic 191-entry, 27-section edition, preserved by this [numbered archive at a pinned revision](https://github.com/Tuhin-SnapD/Striver23-DSA/blob/4468112dd28777476a1ad2e4afe4ec381454bc7d/README.md). The [official historical URL](https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/) now redirects to a different pattern sheet. This import keeps the classic edition requested by users.

`resourceUrl` links to practice or study material; `sourceUrl` records provenance.
Unknown difficulties remain `Unrated`. Algorithm variants with the same practice
link retain separate study entries. Genuine repeated questions share one question
ID, so solving or bookmarking either row updates both. A sheet's displayed count
is its source entry count, not its number of unique question IDs.

From `server/`, preview with `npm run seed:sheets -- --dry-run`, then apply with
`npm run seed:sheets`. The import adds missing questions and sheet memberships,
preserves existing IDs and metadata, and publishes the complete ordered entries
last. It never deletes questions, memberships, or user progress. Re-running it
does not insert duplicate questions. No import runs automatically at startup.

External sites may change or require an account; source and archive links are
included so a collection remains traceable when a practice URL changes.
