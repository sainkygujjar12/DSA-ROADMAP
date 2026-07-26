require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Topic = require("./models/Topic");
const Company = require("./models/Company");
const Sheet = require("./models/Sheet");
const Question = require("./models/Question");

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
        isPremium: !!item.isPremium,
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

    if (errors.length) {
      console.log("\n⚠️  Issues:");
      errors.forEach((e) => console.log("   - " + e));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedQuestions();
