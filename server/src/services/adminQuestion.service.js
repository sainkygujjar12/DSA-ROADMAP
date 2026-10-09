const { escapeRegex, pageSize, pageNumber } = require("../utils/queryValidation");
const Question = require("../models/Question");
const Topic = require("../models/Topic");
const Company = require("../models/Company");
const Sheet = require("../models/Sheet");


// ======================================
// Get All Questions
// ======================================

exports.getQuestions = async ({
  page = 1,
  limit = 10,
  search = "",
  difficulty = "",
}) => {
  page = pageNumber(page);
  limit = pageSize(limit);
  const query = {};

  if (search) {
    query.title = {
      $regex: escapeRegex(String(search).slice(0, 120)),
      $options: "i",
    };
  }

  if (difficulty && difficulty !== "All") {
    query.difficulty = difficulty;
  }

  const total = await Question.countDocuments(query);

  const questions = await Question.find(query)
    .populate("topic", "name slug")
    .populate("companies", "name")
    .populate("sheets", "name")
    .sort({
      createdAt: -1,
    })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return {
    questions,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

// ======================================
// Get One Question
// ======================================

exports.getQuestion = async (id) => {
  return await Question.findById(id)
    .populate("topic")
    .populate("companies")
    .populate("sheets");
};

// ======================================
// Create Question
// ======================================

exports.createQuestion = async (data) => {
  return await Question.create(data);
};

// ======================================
// Update Question
// ======================================

exports.updateQuestion = async (
  id,
  data
) => {
  return await Question.findByIdAndUpdate(
    id,
    data,
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );
};

// ======================================
// Delete Question
// ======================================

exports.deleteQuestion = async (id) => {
  return await Question.findByIdAndDelete(id);
};

// ======================================
// Bulk Import Questions
// Accepts an array of question objects where
// `topic` is a Topic slug, and `companies` /
// `sheets` are arrays of Company / Sheet names.
// Upserts by slug so it's safe to re-run.
// ======================================

exports.bulkImportQuestions = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error(
      "Payload must be a non-empty array of questions"
    );
    err.statusCode = 400;
    throw err;
  }

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

  for (const [index, item] of items.entries()) {
    const label = item.title || `Row ${index + 1}`;

    if (!item.title || !item.slug || (!item.leetcodeUrl && !item.gfgUrl)) {
      skipped++;
      errors.push(
        `${label} — missing required field (title, slug, or leetcodeUrl/gfgUrl)`
      );
      continue;
    }

    const topic = topicBySlug.get(item.topic);

    if (!topic) {
      skipped++;
      errors.push(
        `${label} — unknown topic slug "${item.topic}"`
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
      difficulty: item.difficulty || "Medium",
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
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      if (alreadyExists) {
        updated++;
      } else {
        created++;
      }
    } catch (err) {
      skipped++;
      errors.push(`${label} — ${err.message}`);
    }
  }

  // Keep Sheet.totalQuestions counts accurate
  const touchedSheets = new Set();
  items.forEach((item) =>
    (item.sheets || []).forEach((s) => touchedSheets.add(s))
  );

  for (const sheetName of touchedSheets) {
    const sheet = sheetByName.get(sheetName);
    if (!sheet) continue;

    const count = await Question.countDocuments({
      sheets: sheet._id,
    });

    await Sheet.findByIdAndUpdate(sheet._id, {
      totalQuestions: count,
    });
  }

  return {
    total: items.length,
    created,
    updated,
    skipped,
    errors,
  };
};
