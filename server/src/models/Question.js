const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },

    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },
    ],

    sheets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sheet",
      },
    ],

    leetcodeUrl: {
      type: String,
      default: "",
    },

    gfgUrl: {
      type: String,
      default: "",
    },

    leetcodeNumber: {
      type: Number,
      default: null,
    },

    youtubeUrl: {
      type: String,
      default: "",
    },

    articleUrl: {
      type: String,
      default: "",
    },

    frequency: {
      type: Number,
      default: 0,
    },

    tags: [
      {
        type: String,
      },
    ],

    isPremium: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.pre("validate", function (next) {
  if (!this.leetcodeUrl && !this.gfgUrl) {
    return next(
      new Error(
        "A question needs at least one of leetcodeUrl or gfgUrl"
      )
    );
  }
  next();
});

module.exports = mongoose.model("Question", questionSchema);