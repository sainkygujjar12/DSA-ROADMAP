const Question = require("../models/Question");
const Company = require("../models/Company");
const Topic = require("../models/Topic");
const Sheet = require("../models/Sheet");

// ======================================
// Public Stats
// Real counts for the landing page — no fabricated
// marketing numbers.
// ======================================

exports.getPublicStats = async (req, res) => {
  try {
    const [
      totalQuestions,
      totalCompanies,
      totalTopics,
      totalSheets,
    ] = await Promise.all([
      Question.countDocuments({ isActive: true }),
      Company.countDocuments(),
      Topic.countDocuments(),
      Sheet.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalQuestions,
        totalCompanies,
        totalTopics,
        totalSheets,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
