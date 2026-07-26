const Topic = require("../models/Topic");
const Question = require("../models/Question");
const {
  getUserQuestionFlags,
  attachUserFlags,
} = require("../services/progress.service");

// ==============================
// GET ALL TOPICS
// ==============================
const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find();

    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET SINGLE TOPIC BY SLUG
// ==============================
const getSingleTopic = async (req, res) => {
  try {
    const slug = req.params.slug;

    const topic = await Topic.findOne({ slug });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    const questions = await Question.find({
      topic: topic._id,
      isActive: true,
    })
      .populate("companies", "name slug")
      .populate("sheets", "name slug")
      .sort({ difficulty: 1, title: 1 });

    const { solvedSet, bookmarkedSet } =
      await getUserQuestionFlags(req.user?.id);

    return res.status(200).json({
      success: true,
      data: {
        topic,
        questions: attachUserFlags(
          questions,
          solvedSet,
          bookmarkedSet
        ),
      },
    });

  } catch (error) {
    console.error("Topic error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// CREATE TOPIC
// ==============================
const createTopic = async (req, res) => {
  try {
    const topic = await Topic.create(req.body);

    res.status(201).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// UPDATE TOPIC
// ==============================
const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// DELETE TOPIC
// ==============================
const deleteTopic = async (req, res) => {
  try {
    await Topic.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Topic deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// EXPORT (ONLY ONCE)
// ==============================
module.exports = {
  getAllTopics,
  getSingleTopic,
  createTopic,
  updateTopic,
  deleteTopic,
};