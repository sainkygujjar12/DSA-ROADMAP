require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const Sheet = require("./models/Sheet");
const Question = require("./models/Question");
const Topic = require("./models/Topic");
const topicDefinitions = require("./data/topics");
const { sheets, validateSheets, planQuestions } = require("./data/curatedSheets");

async function seed({ dryRun = false } = {}) {
  validateSheets();
  const [catalog, currentTopics, currentSheets] = await Promise.all([
    Question.find().select("_id slug leetcodeUrl gfgUrl resourceUrl").lean(),
    Topic.find().select("_id slug").lean(),
    Sheet.find({ slug: { $in: sheets.map(sheet => sheet.slug) } }).select("_id slug").lean(),
  ]);
  const plan = planQuestions(catalog);
  const summary = {
    dryRun,
    sheets: plan.sheets.map(sheet => ({ slug: sheet.slug, entries: sheet.entries.length, sections: new Set(sheet.entries.map(entry => entry.section)).size, uniqueQuestions: new Set(sheet.entries.map(entry => entry.questionSlug)).size })),
    existingQuestionsReused: new Set(plan.sheets.flatMap(sheet => sheet.entries.map(entry => entry.questionSlug))).size - plan.newQuestions.length,
    newQuestions: plan.newQuestions.length,
    newSheets: sheets.length - currentSheets.length,
    newTopics: topicDefinitions.filter(topic => !currentTopics.some(current => current.slug === topic.slug)).length,
  };
  if (dryRun) return summary;

  // Additive import: existing IDs, question metadata, company links, other sheet
  // memberships and every user's progress are preserved. Publication is last,
  // so an interrupted import cannot expose a partially populated source sheet.
  await Topic.bulkWrite(topicDefinitions.map(topic => ({ updateOne: {
    filter: { slug: topic.slug }, update: { $setOnInsert: topic }, upsert: true,
  } })));
  const topics = await Topic.find().select("_id slug").lean();
  const topicBySlug = new Map(topics.map(topic => [topic.slug, topic._id]));
  if (plan.newQuestions.length) {
    await Question.bulkWrite(plan.newQuestions.map(question => ({ updateOne: {
      filter: { slug: question.slug },
      update: { $setOnInsert: { ...question, topic: topicBySlug.get(question.topic) } },
      upsert: true,
    } })));
  }
  const requiredSlugs = [...new Set(plan.sheets.flatMap(sheet => sheet.entries.map(entry => entry.questionSlug)))];
  const questions = await Question.find({ slug: { $in: requiredSlugs } }).select("_id slug").lean();
  if (questions.length !== requiredSlugs.length) throw new Error("Cannot publish an incomplete sheet");
  const questionBySlug = new Map(questions.map(question => [question.slug, question._id]));
  for (const sheet of plan.sheets) {
    const { entries, expectedCount, ...metadata } = sheet;
    const doc = await Sheet.findOneAndUpdate(
      { slug: sheet.slug },
      { $setOnInsert: { name: sheet.name, author: sheet.author, description: sheet.description } },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
    await Question.updateMany(
      { _id: { $in: entries.map(entry => questionBySlug.get(entry.questionSlug)) } },
      { $addToSet: { sheets: doc._id } }
    );
    await Sheet.updateOne({ _id: doc._id }, { $set: {
      ...metadata,
      totalQuestions: expectedCount,
      entries: entries.map(({ order, title, section, resourceUrl, sourceUrl, kind, questionSlug }) => ({
        order, title, section, resourceUrl, sourceUrl, kind, question: questionBySlug.get(questionSlug),
      })),
    } }, { runValidators: true });
  }
  return summary;
}

if (require.main === module) {
  (async () => {
    try {
      if (process.argv.some(argument => argument.startsWith("--") && argument !== "--dry-run")) throw new Error("Unsupported argument");
      if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
      console.log(JSON.stringify(await seed({ dryRun: process.argv.includes("--dry-run") }), null, 2));
    } catch (error) {
      console.error(`Sheet import failed (${error.name}). Check configuration, connectivity, and source data.`);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
  })();
}
module.exports = { seed };
