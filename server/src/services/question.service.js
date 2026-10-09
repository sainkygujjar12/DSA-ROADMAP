const Question = require("../models/Question");
const Topic = require("../models/Topic");

// ======================================
// Get All Questions
// ======================================

exports.getQuestions = async () => {
  return await Question.find()
    .populate("topic")
    .populate("companies")
    .populate("sheets")
    .sort({ createdAt: -1 });
};

// ======================================
// Create Question
// ======================================

exports.createQuestion = async (data) => {
  return await Question.create(data);
};

// ======================================
// Get Questions By Topic
// ======================================

exports.getQuestionsByTopic = async (slug) => {
  const topic = await Topic.findOne({ slug });

  if (!topic) {
    return [];
  }

  return await Question.find({
    topic: topic._id,
  })
    .populate("topic", "name slug icon")
    .populate("companies", "name slug logo color")
    .populate("sheets", "name")
    .sort({
      title: 1,
    });
};

// ======================================
// Get Question By Slug
// ======================================

exports.getQuestionBySlug = async (slug) => {
  return await Question.findOne({ slug })
    .populate("topic", "name slug")
    .populate("companies", "name slug logo color")
    .populate("sheets", "name slug");
};

// ======================================
// Update Question
// ======================================

exports.updateQuestion = async (id, data) => {
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
