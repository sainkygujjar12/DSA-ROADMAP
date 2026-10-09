require("dotenv").config();
const mongoose = require("mongoose");
const Company = require("./models/Company");
const Question = require("./models/Question");
const Topic = require("./models/Topic");
const additionalQuestions = [
  ...require("./data/questions/companyRepositoryExpansion"),
  ...require("./data/questions/companyRepositoryRemaining"),
];
const topicDefinitions = require("./data/topics");
const aliases = require("./data/leetcodeSlugAliases.json");
const premiumSlugs = new Set(require("./data/repositoryPremiumSlugs.json"));
const source = require("./data/companyRepository.json");
const companies = require("./data/repositoryCompanies");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Topic.bulkWrite(topicDefinitions.map(topic => ({ updateOne: {
      filter: { slug: topic.slug }, update: { $setOnInsert: topic }, upsert: true,
    } })));
    const topics = await Topic.find().select("_id slug").lean();
    const topicBySlug = new Map(topics.map(topic => [topic.slug, topic._id]));
    if (additionalQuestions.some(question => !topicBySlug.has(question.topic))) {
      throw new Error("Seed the topics before importing repository questions");
    }
    const missing = new Set();
    let created = 0;
    let linksAdded = 0;
    let matchedLinks = 0;
    for (const metadata of companies) {
      const { sourceUrl, sourceNote, ...fields } = metadata;
      const result = await Company.updateOne(
        { slug: metadata.slug },
        { $setOnInsert: fields, $set: { sourceUrl, sourceNote } },
        { upsert: true, runValidators: true }
      );
      created += result.upsertedCount;
    }
    const companyDocs = await Company.find({ slug: { $in: companies.map(c => c.slug) } }).lean();
    const companyBySlug = new Map(companyDocs.map(c => [c.slug, c]));
    const questionResult = await Question.bulkWrite(additionalQuestions.map(question => {
      const fields = { ...question, topic: topicBySlug.get(question.topic), isActive: true };
      delete fields.companies;
      return {
        updateOne: {
          filter: { slug: question.slug },
          update: { $setOnInsert: fields },
          upsert: true,
        },
      };
    }));
    const catalog = await Question.find({ isActive: true }).select("_id slug").lean();
    const questionBySlug = new Map(catalog.map(question => [question.slug, question._id]));
    const operations = new Map();
    for (const entry of source.companies) {
      const company = companyBySlug.get(entry.slug);
      let matched = 0;
      for (const sourceSlug of entry.slugs) {
        const slug = aliases[sourceSlug] || sourceSlug;
        const id = questionBySlug.get(slug);
        if (!id) { missing.add(slug); continue; }
        if (!operations.has(slug)) operations.set(slug, { id, companies: [] });
        operations.get(slug).companies.push(company._id);
        matched++;
      }
      if (!matched) throw new Error(`No catalog questions matched for ${entry.slug}`);
      matchedLinks += matched;
    }
    if (missing.size) throw new Error("Repository coverage is incomplete");
    // Only add relationships: existing question IDs and progress stay intact.
    const updates = [...operations.entries()].map(([slug, { id, companies: ids }]) => ({
      updateOne: {
        filter: { _id: id },
        update: {
          $addToSet: { companies: { $each: ids } },
          $set: { isPremium: premiumSlugs.has(slug) },
        },
      },
    }));
    if (updates.length) {
      const result = await Question.bulkWrite(updates);
      linksAdded = result.modifiedCount;
    }
    console.log(JSON.stringify({
      sourceCompanies: companies.length, createdCompanies: created,
      createdQuestions: questionResult.upsertedCount,
      matchedCompanyQuestionLinks: matchedLinks, updatedQuestions: linksAdded,
      unmatchedUniqueProblems: missing.size,
      repositoryQuestionsCovered: operations.size,
      totalQuestions: await Question.countDocuments({ isActive: true }),
      totalCompanies: await Company.countDocuments({ isActive: true }),
    }, null, 2));
  } catch (error) {
    console.error(`Company import failed (${error.name}). Check configuration, catalog, and connectivity.`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
