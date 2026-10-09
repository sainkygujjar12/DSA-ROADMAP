const Topic = require("../models/Topic");
const Question = require("../models/Question");

exports.getTopics = async () => {
  const topics = await Topic.find().sort({ order: 1 }).lean();

  const stats = await Question.aggregate([
    {
      $group: {
        _id: "$topic",
        totalQuestions: { $sum: 1 },

        easy: {
          $sum: {
            $cond: [{ $eq: ["$difficulty", "Easy"] }, 1, 0],
          },
        },

        medium: {
          $sum: {
            $cond: [{ $eq: ["$difficulty", "Medium"] }, 1, 0],
          },
        },

        hard: {
          $sum: {
            $cond: [{ $eq: ["$difficulty", "Hard"] }, 1, 0],
          },
        },
      },
    },
  ]);

  const statsMap = new Map();

  stats.forEach((item) => {
    statsMap.set(item._id.toString(), item);
  });

  return topics.map((topic) => {
    const topicStats = statsMap.get(topic._id.toString());

    return {
      ...topic,

      totalQuestions: topicStats?.totalQuestions || 0,

      easy: topicStats?.easy || 0,

      medium: topicStats?.medium || 0,

      hard: topicStats?.hard || 0,

      progress: 0,
    };
  });
};

exports.getTopicById = async (id) => {
  return await Topic.findById(id);
};

exports.createTopic = async (data) => {
  return await Topic.create(data);
};

exports.updateTopic = async (id, data) => {
  return await Topic.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
    runValidators: true,
  });
};

exports.deleteTopic = async (id) => {
  return await Topic.findByIdAndDelete(id);
};
