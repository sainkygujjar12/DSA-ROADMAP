const User = require("../models/User");
const Progress = require("../models/Progress");
const Question = require("../models/Question");

// ======================================
// Get Dashboard Stats
// ======================================

exports.getDashboardStats = async (userId) => {
  const [user, progress, totalQuestions] = await Promise.all([
    User.findById(userId).select(
    "name email avatar"
  ).lean(),

  // Progress
  Progress.findOne({
    user: userId,
  })
    .populate({
      path: "solvedQuestions",
      select:
        "title slug difficulty topic createdAt",
      populate: {
        path: "topic",
        select: "name slug icon",
      },
    })
    .populate({
      path: "bookmarkedQuestions",
      select:
        "title slug difficulty topic",
      populate: {
        path: "topic",
        select: "name slug icon",
      },
    })
    .populate({
      path: "lastVisitedQuestion",
      select:
        "title slug difficulty topic",
      populate: {
        path: "topic",
        select: "name slug icon",
      },
    })
    .populate({
      path: "notes.question",
      select: "title slug",
    }).lean(),

  // Total Questions
    Question.countDocuments({
      isActive: true,
    }),
  ]);

  // If user has no progress
  if (!progress) {
    return {
      user,

      stats: {
        totalQuestions,
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        streak: 0,
        bestStreak: 0,
        overallProgress: 0,
      },

      activity: [],

      continueLearning: null,

      recentSolved: [],

      bookmarks: [],

      notes: [],

      notesCount: 0,
    };
  }

  // Total Solved
  const totalSolved =
    progress.solvedQuestions.length;

  // Overall Progress
  const overallProgress =
    totalQuestions === 0
      ? 0
      : Math.round(
          (totalSolved / totalQuestions) * 100
        );

  // Recently Solved
  const recentSolved =
    progress.solvedQuestions
      .slice(-5)
      .reverse();

  return {
    user,

    stats: {
      totalQuestions,

      totalSolved,

      easySolved:
        progress.easySolved,

      mediumSolved:
        progress.mediumSolved,

      hardSolved:
        progress.hardSolved,

      streak:
        progress.streak,

      bestStreak:
        progress.bestStreak || progress.streak || 0,

      overallProgress,
    },

    continueLearning:
      progress.lastVisitedQuestion,

    recentSolved,

    bookmarks:
      progress.bookmarkedQuestions,

    notes:
      progress.notes,

    notesCount:
      progress.notes.length,

    activity: progress.activity || [],
  };
};
