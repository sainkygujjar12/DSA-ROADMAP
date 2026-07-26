const Topic = require("../models/Topic");
const Question = require("../models/Question");

exports.getRoadmap = async () => {
  const topics = await Topic.find().sort({ order: 1 });

  const roadmap = await Promise.all(
    topics.map(async (topic) => {
      const questions = await Question.find({ topic: topic._id });

      const easy = questions.filter(
        (q) => q.difficulty === "Easy"
      ).length;

      const medium = questions.filter(
        (q) => q.difficulty === "Medium"
      ).length;

      const hard = questions.filter(
        (q) => q.difficulty === "Hard"
      ).length;

      return {
        ...topic.toObject(),
        totalQuestions: questions.length,
        easy,
        medium,
        hard,
        progress: 0,
      };
    })
  );

  return roadmap;
};