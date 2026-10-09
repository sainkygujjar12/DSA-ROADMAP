const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    solvedQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    bookmarkedQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    lastVisitedQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },

    notes: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },

        content: {
          type: String,
          default: "",
        },
      },
    ],

    easySolved: {
      type: Number,
      default: 0,
    },

    mediumSolved: {
      type: Number,
      default: 0,
    },

    hardSolved: {
      type: Number,
      default: 0,
    },

    // Daily solve counts used by the dashboard and profile heatmaps.
    activity: [
      {
        date: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],

    streak: {
      type: Number,
      default: 0,
    },

    bestStreak: {
      type: Number,
      default: 0,
    },

    lastSolvedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

module.exports = mongoose.model("Progress", progressSchema);
