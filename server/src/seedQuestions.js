require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Topic = require("./models/Topic");
const Company = require("./models/Company");
const Sheet = require("./models/Sheet");
const Question = require("./models/Question");
const companyQuestionBackfill = require("./data/companyQuestionBackfill");
const repository = require("./data/companyRepository.json");
const slugAliases = require("./data/leetcodeSlugAliases.json");
const repositoryPremiumSlugs = new Set(require("./data/repositoryPremiumSlugs.json"));

const MIN_COMPANY_QUESTIONS = 100;

// ==========================================
// Auto-discover every topic file inside
// server/src/data/questions/*.js
// Each file must export an array of question
// objects in the shared format.
// ==========================================

function loadAllQuestionFiles() {
  const dir = path.join(__dirname, "data", "questions");

  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".js"));

  let all = [];
  const loadIssues = [];

  for (const file of files) {
    const items = require(path.join(dir, file));

    if (!Array.isArray(items)) {
      loadIssues.push(
        `${file} — does not export an array (skipped entire file)`
      );
      continue;
    }

    items.forEach((item, index) => {
      // Guards against malformed entries — e.g. an accidental
      // double comma in the array literal (`{...}, , {...}`)
      // which silently creates an `undefined`/`null` slot.
      if (!item || typeof item !== "object") {
        loadIssues.push(
          `${file} — entry at index ${index} is ${item} (likely a stray comma nearby in the file). Skipped.`
        );
        return;
      }

      if (!item.title || !item.slug || !item.topic || (!item.leetcodeUrl && !item.gfgUrl)) {
        loadIssues.push(
          `${file} — entry at index ${index} (${
            item.title || "untitled"
          }) is missing a required field (title/slug/topic/leetcodeUrl-or-gfgUrl). Skipped.`
        );
        return;
      }

      all.push(item);
    });
  }

  return { all, loadIssues };
}

async function seedQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    const { all: allQuestions, loadIssues } = loadAllQuestionFiles();

    console.log(
      `📄 Found ${allQuestions.length} valid questions across data files`
    );

    if (loadIssues.length) {
      console.log(
        `\n⚠️  ${loadIssues.length} entries were skipped before touching the database:`
      );
      loadIssues.forEach((e) => console.log("   - " + e));
      console.log("");
    }

    // Preload topics/companies/sheets once instead of
    // re-querying per question (much faster for large sets)
    const [allTopics, allCompanies, allSheets] =
      await Promise.all([
        Topic.find(),
        Company.find(),
        Sheet.find(),
      ]);

    const topicBySlug = new Map(
      allTopics.map((t) => [t.slug, t])
    );
    const companyByName = new Map(
      allCompanies.map((c) => [c.name, c])
    );
    const sheetByName = new Map(
      allSheets.map((s) => [s.name, s])
    );

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (const item of allQuestions) {
      const topic = topicBySlug.get(item.topic);

      if (!topic) {
        skipped++;
        errors.push(
          `"${item.title}" — unknown topic slug "${item.topic}"`
        );
        continue;
      }

      const companies = (item.companies || [])
        .map((name) => companyByName.get(name))
        .filter(Boolean);

      const sheets = (item.sheets || [])
        .map((name) => sheetByName.get(name))
        .filter(Boolean);

      const doc = {
        title: item.title,
        slug: item.slug,
        difficulty: item.difficulty,
        topic: topic._id,
        companies: companies.map((c) => c._id),
        sheets: sheets.map((s) => s._id),
        leetcodeUrl: item.leetcodeUrl || "",
        gfgUrl: item.gfgUrl || "",
        leetcodeNumber: item.leetcodeNumber || null,
        youtubeUrl: item.youtubeUrl || "",
        articleUrl: item.articleUrl || "",
        frequency: item.frequency || 0,
        tags: item.tags || [],
        isPremium: repositoryPremiumSlugs.has(item.slug) || !!item.isPremium,
        isActive: true,
      };

      try {
        const alreadyExists = await Question.exists({
          slug: item.slug,
        });

        await Question.findOneAndUpdate(
          { slug: item.slug },
          { $set: doc },
          {
            upsert: true,
            setDefaultsOnInsert: true,
            runValidators: true,
          }
        );

        if (alreadyExists) {
          updated++;
        } else {
          created++;
        }
      } catch (err) {
        skipped++;
        errors.push(`"${item.title}" — ${err.message}`);
      }
    }

    // Backfill company practice lists with questions already in this catalog.
    // addToSet keeps this safe to run repeatedly and avoids duplicate company
    // references on a question.
    let companyLinksAdded = 0;
    const companyBackfillIssues = [];

    const catalogSlugs = new Set(allQuestions.map(question => question.slug));
    const companyLists = { ...companyQuestionBackfill };
    for (const entry of repository.companies) {
      companyLists[entry.name] = [...new Set([
        ...(companyLists[entry.name] || []),
        ...entry.slugs.map(slug => slugAliases[slug] || slug).filter(slug => catalogSlugs.has(slug)),
      ])];
    }
    for (const [companyName, slugs] of Object.entries(companyLists)) {
      const company = companyByName.get(companyName);

      if (!company) {
        companyBackfillIssues.push(`Unknown company "${companyName}"`);
        continue;
      }

      const result = await Question.updateMany(
        { slug: { $in: slugs } },
        { $addToSet: { companies: company._id } }
      );

      companyLinksAdded += result.modifiedCount || 0;

      const foundSlugs = await Question.find({ slug: { $in: slugs } }).select("slug").lean();
      const found = new Set(foundSlugs.map((question) => question.slug));
      slugs
        .filter((slug) => !found.has(slug))
        .forEach((slug) => companyBackfillIssues.push(`${companyName}: missing question slug "${slug}"`));
    }

    // Guarantee a useful practice list for every company without creating
    // fake questions. Reuse the existing catalog and spread the additions
    // across difficulty levels so each company gets a balanced list.
    const catalogQuestions = await Question.find({ isActive: true })
      .select("_id slug difficulty companies")
      .sort({ slug: 1 })
      .lean();

    for (const company of allCompanies.filter((item) => item.isActive !== false)) {
      // Repository lists must not be padded with unrelated company tags.
      if (repository.companies.some(entry => entry.slug === company.slug)) continue;
      const assignedIds = new Set(
        catalogQuestions
          .filter((question) => question.companies?.some((id) => id.toString() === company._id.toString()))
          .map((question) => question._id.toString())
      );

      const needed = MIN_COMPANY_QUESTIONS - assignedIds.size;
      if (needed <= 0) continue;

      const candidatesByDifficulty = {
        Easy: [],
        Medium: [],
        Hard: [],
      };

      catalogQuestions
        .filter((question) => !assignedIds.has(question._id.toString()))
        .forEach((question) => {
          candidatesByDifficulty[question.difficulty]?.push(question);
        });

      const selected = [];
      const levels = ["Easy", "Medium", "Hard"];
      let levelIndex = 0;

      while (selected.length < needed) {
        let addedThisRound = false;

        for (let attempt = 0; attempt < levels.length; attempt++) {
          const level = levels[(levelIndex + attempt) % levels.length];
          const candidate = candidatesByDifficulty[level].shift();

          if (candidate) {
            selected.push(candidate);
            levelIndex = (levelIndex + attempt + 1) % levels.length;
            addedThisRound = true;
            break;
          }
        }

        if (!addedThisRound) break;
      }

      if (selected.length) {
        const result = await Question.updateMany(
          { _id: { $in: selected.map((question) => question._id) } },
          { $addToSet: { companies: company._id } }
        );
        companyLinksAdded += result.modifiedCount || 0;
      }
    }

    // Keep each Sheet's totalQuestions count in sync
    for (const sheet of allSheets) {
      const count = await Question.countDocuments({
        sheets: sheet._id,
      });

      await Sheet.findByIdAndUpdate(sheet._id, {
        totalQuestions: count,
      });
    }

    console.log("\n🎉 Seed complete");
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Company links added: ${companyLinksAdded}`);

    const companyCounts = await Promise.all(
      allCompanies.map(async (company) => ({
        name: company.name,
        count: await Question.countDocuments({ companies: company._id }),
      }))
    );
    console.log(`   Company minimum: ${MIN_COMPANY_QUESTIONS}`);
    companyCounts.forEach(({ name, count }) => console.log(`   ${name}: ${count}`));

    if (errors.length || companyBackfillIssues.length) {
      console.log("\n⚠️  Issues:");
      errors.forEach((e) => console.log("   - " + e));
      companyBackfillIssues.forEach((e) => console.log("   - " + e));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedQuestions();
