require("dotenv").config();
const mongoose = require("mongoose");
const Topic = require("./models/Topic");
const Company = require("./models/Company");
const Question = require("./models/Question");
const topics = require("./data/topics");
const companies = require("./data/additionalCompanies");
const questions = require("./data/questions/interviewExpansion");

async function seedExpansion() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Preserve IDs and existing edits: never delete catalog or progress data.
    for (const topic of topics) {
      await Topic.updateOne({ slug: topic.slug }, { $setOnInsert: topic }, { upsert: true });
    }
    for (const company of companies) {
      await Company.updateOne({ slug: company.slug }, { $setOnInsert: company }, { upsert: true });
    }
    const topicDocs = await Topic.find().lean();
    const companyDocs = await Company.find({ slug: { $in: companies.map(c => c.slug) } }).lean();
    const topicMap = new Map(topicDocs.map(t => [t.slug, t._id]));
    const companyIds = companyDocs.map(c => c._id);
    let created = 0;
    for (const question of questions) {
      const { companies: practiceCompanies, ...fields } = question;
      if (!practiceCompanies.length || !topicMap.has(question.topic)) throw new Error("Invalid expansion data");
      const result = await Question.updateOne(
        { slug: question.slug },
        {
          $setOnInsert: { ...fields, topic: topicMap.get(question.topic), isActive: true },
          $addToSet: { companies: { $each: companyIds } },
        },
        { upsert: true, runValidators: true }
      );
      created += result.upsertedCount;
    }
    console.log(`Expansion complete: ${created} new questions; ${questions.length} catalog entries linked.`);
    for (const company of companyDocs) {
      const count = await Question.countDocuments({ companies: company._id, isActive: true });
      console.log(`${company.name}: ${count} questions`);
    }
  } catch (error) {
    // Do not print connection strings or database credentials.
    console.error(`Expansion failed (${error.name}). Check database connectivity and configuration.`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedExpansion();
