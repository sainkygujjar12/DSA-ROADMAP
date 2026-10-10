const { escapeRegex, pageSize, pageNumber } = require("../utils/queryValidation");
const Topic = require("../models/Topic");
const Question = require("../models/Question");
const Progress = require("../models/Progress");
const { catalogCache } = require('../utils/catalogCache');
const {
  attachUserFlags,
} = require("../services/progress.service");

// ==============================
// GET ALL TOPICS
// ==============================
const getAllTopics = async (req, res) => {
  try {
    const [topics, questionCounts] = await catalogCache.get('topics', () => Promise.all([
      Topic.find().sort({ order: 1 }).lean(),
      Question.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$topic",
            totalQuestions: { $sum: 1 },
          },
        },
      ]),
    ]));

    const countByTopic = new Map(
      questionCounts.map((item) => [
        item._id.toString(),
        item.totalQuestions,
      ])
    );

    let solvedByTopic = new Map();

    if (req.user?.id) {
      const progress = await Progress.findOne({ user: req.user.id })
        .select("solvedQuestions")
        .populate({ path: "solvedQuestions", select: "topic", match: { isActive: true } })
        .lean();

      solvedByTopic = (progress?.solvedQuestions || []).reduce(
        (map, question) => {
          const topicId = question?.topic?.toString();
          if (topicId) {
            map.set(topicId, (map.get(topicId) || 0) + 1);
          }
          return map;
        },
        new Map()
      );
    }

    const enrichedTopics = topics.map((topic) => {
      const totalQuestions = countByTopic.get(topic._id.toString()) || 0;
      const solvedQuestions = solvedByTopic.get(topic._id.toString()) || 0;

      return {
        ...topic,
        totalQuestions,
        solvedQuestions,
        progress: totalQuestions
          ? Math.round((solvedQuestions / totalQuestions) * 100)
          : 0,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedTopics,
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
    const { slug } = req.params;
    const {
      page = 1,
      limit = 10,
      difficulty = "All",
      pattern = "All",
      search = "",
    } = req.query;

    const topic = await Topic.findOne({ slug });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    // Build query filter
    const query = {
      topic: topic._id,
      isActive: true,
    };

    if (difficulty !== "All") {
      query.difficulty = difficulty;
    }

    if (pattern !== "All") {
      query.tags = { $in: [pattern] };
    }

    if (typeof search === "string" && search.trim()) {
      query.title = {
        $regex: escapeRegex(search.trim().slice(0, 120)),
        $options: "i",
      };
    }

    const skip = (pageNumber(page) - 1) * pageSize(limit);

    const [questions, total, topicDifficultyTotals, progress] = await Promise.all([
      Question.find(query)
        .populate("companies", "name slug logo color")
        .populate("sheets", "name slug")
        .sort({ difficulty: 1, title: 1 })
        .skip(skip)
        .limit(pageSize(limit)),
      Question.countDocuments(query),
      // Summary totals deliberately ignore pagination and search filters.
      Question.aggregate([
      {
        $match: {
          topic: topic._id,
          isActive: true,
        },
      },
      {
        $group: {
          _id: "$difficulty",
          total: { $sum: 1 },
        },
      },
      ]),
      req.user?.id
      ? Progress.findOne({ user: req.user.id })
          .select("solvedQuestions bookmarkedQuestions")
          .lean()
      : null,
    ]);
    const solvedIds = progress?.solvedQuestions || [];
    const solvedDifficultyTotals = solvedIds.length
      ? await Question.aggregate([
          {
            $match: {
              _id: { $in: solvedIds },
              topic: topic._id,
              isActive: true,
            },
          },
          {
            $group: {
              _id: "$difficulty",
              solved: { $sum: 1 },
            },
          },
        ])
      : [];

    const difficultyStats = {
      Easy: { total: 0, solved: 0 },
      Medium: { total: 0, solved: 0 },
      Hard: { total: 0, solved: 0 },
      Unrated: { total: 0, solved: 0 },
    };

    topicDifficultyTotals.forEach(({ _id, total: count }) => {
      if (difficultyStats[_id]) difficultyStats[_id].total = count;
    });
    solvedDifficultyTotals.forEach(({ _id, solved: count }) => {
      if (difficultyStats[_id]) difficultyStats[_id].solved = count;
    });

    const topicTotal = Object.values(difficultyStats).reduce(
      (sum, item) => sum + item.total,
      0
    );
    const topicSolved = Object.values(difficultyStats).reduce(
      (sum, item) => sum + item.solved,
      0
    );

    const solvedSet = new Set(solvedIds.map(String));
    const bookmarkedSet = new Set((progress?.bookmarkedQuestions || []).map(String));

    return res.status(200).json({
      success: true,
      data: {
        topic,
        questions: attachUserFlags(
          questions,
          solvedSet,
          bookmarkedSet
        ),
        pagination: {
          total,
          page: pageNumber(page),
          pages: Math.ceil(total / pageSize(limit)),
          limit: pageSize(limit),
        },
        stats: {
          total: topicTotal,
          solved: topicSolved,
          progress: topicTotal
            ? Math.round((topicSolved / topicTotal) * 100)
            : 0,
          easy: difficultyStats.Easy,
          medium: difficultyStats.Medium,
          hard: difficultyStats.Hard,
          unrated: difficultyStats.Unrated,
        },
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
      { returnDocument: 'after' }
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
