const Sheet = require("../models/Sheet");
const Question = require("../models/Question");
const {
  getUserQuestionFlags,
  attachUserFlags,
} = require("./progress.service");

// ======================================
// Get All Sheets
// ======================================

exports.getSheets = async () => {
  const sheets = await Sheet.find().sort({
    name: 1,
  });

  const result = await Promise.all(
    sheets.map(async (sheet) => {
      const totalQuestions =
        await Question.countDocuments({
          sheets: sheet._id,
        });

      return {
        ...sheet.toObject(),
        totalQuestions,
      };
    })
  );

  return result;
};

// ======================================
// Get Sheet By Slug
// ======================================

exports.getSheetBySlug = async (slug, userId) => {
  const sheet = await Sheet.findOne({
    slug,
  });

  if (!sheet) {
    throw new Error("Sheet not found");
  }

  const questions = await Question.find({
    sheets: sheet._id,
  })
    .populate("topic", "name slug icon")
    .populate("companies", "name logo")
    .populate("sheets", "name")
    .sort({
      difficulty: 1,
      title: 1,
    });

  const { solvedSet, bookmarkedSet } =
    await getUserQuestionFlags(userId);

  return {
    sheet,
    questions: attachUserFlags(
      questions,
      solvedSet,
      bookmarkedSet
    ),
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
      new: true,
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