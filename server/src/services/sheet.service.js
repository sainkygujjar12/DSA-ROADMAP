const Sheet = require("../models/Sheet");
const Question = require("../models/Question");
const { catalogCache } = require('../utils/catalogCache');
const {
  getUserQuestionFlags,
  attachUserFlags,
} = require("./progress.service");

// ======================================
// Get All Sheets
// ======================================

exports.getSheets = () => catalogCache.get('sheets', async () => {
  const sheets = await Sheet.find().sort({
    name: 1,
  }).select('-entries.title -entries.order -entries.resourceUrl -entries.sourceUrl -entries.question -entries.kind').lean();

  const result = await Promise.all(
    sheets.map(async (sheet) => {
      const totalQuestions = sheet.entries?.length || await Question.countDocuments({ sheets: sheet._id });
      const { entries, ...metadata } = sheet;

      return {
        ...metadata,
        totalQuestions,
        sectionCount: new Set((entries || []).map(entry => entry.section)).size,
      };
    })
  );

  return result;
});

// ======================================
// Get Sheet By Slug
// ======================================

exports.getSheetBySlug = async (slug, userId) => {
  const sheet = await Sheet.findOne({
    slug,
  }).lean();

  if (!sheet) {
    const error = new Error("Sheet not found");
    error.statusCode = 404;
    throw error;
  }

  const orderedEntries = [...(sheet.entries || [])].sort((a, b) => a.order - b.order);
  const [questions, { solvedSet, bookmarkedSet }] = await Promise.all([Question.find(orderedEntries.length
    ? { _id: { $in: orderedEntries.map(entry => entry.question) } }
    : { sheets: sheet._id })
    .populate("topic", "name slug icon")
    .populate("companies", "name slug logo color")
    .populate("sheets", "name slug")
    .sort({
      difficulty: 1,
      title: 1,
    }).lean(), getUserQuestionFlags(userId)]);

  const flagged = attachUserFlags(questions, solvedSet, bookmarkedSet);
  const byId = new Map(flagged.map(question => [question._id.toString(), question]));
  const { entries, ...metadata } = sheet;
  return {
    sheet: { ...metadata, totalQuestions: entries?.length || questions.length },
    questions: orderedEntries.length ? orderedEntries.map(entry => {
      const question = byId.get(entry.question.toString());
      if (!question) throw new Error("A sheet entry is unavailable. Please restore its question before publishing.");
      return {
        ...question,
        title: entry.title,
        entryKey: `${sheet.slug}:${entry.order}`,
        sourceOrder: entry.order,
        section: entry.section,
        kind: entry.kind,
        resourceUrl: entry.resourceUrl,
        sourceUrl: entry.sourceUrl,
      };
    }) : flagged,
  };
};

// ======================================
// Create Sheet
// ======================================

exports.createSheet = async (data) => {
  return await Sheet.create(data);
};

// ======================================
// Update Sheet
// ======================================

exports.updateSheet = async (id, data) => {
  return await Sheet.findByIdAndUpdate(
    id,
    data,
    {
      returnDocument: 'after',
      runValidators: true,
    }
  );
};

// ======================================
// Delete Sheet
// ======================================

exports.deleteSheet = async (id) => {
  return await Sheet.findByIdAndDelete(id);
};
