const Question = require("../models/Question");
const Topic = require("../models/Topic");
const Company = require("../models/Company");
const Sheet = require("../models/Sheet");
const User = require("../models/User");

// ======================================
// Dashboard Stats
// ======================================

exports.getAdminStats = async () => {
  const [
    totalQuestions,
    totalTopics,
    totalCompanies,
    totalSheets,
    totalUsers,
  ] = await Promise.all([
    Question.countDocuments(),
    Topic.countDocuments(),
    Company.countDocuments(),
    Sheet.countDocuments(),
    User.countDocuments(),
  ]);

  const recentQuestions = await Question.find()
    .populate("topic", "name")
    .sort({ createdAt: -1 })
    .limit(10);

  return {
    stats: {
      totalQuestions,
      totalTopics,
      totalCompanies,
      totalSheets,
      totalUsers,
    },
    recentQuestions,
  };
};