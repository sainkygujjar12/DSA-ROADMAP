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
      enum: ["Easy", "Medium", "Hard", "Unrated"],
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

    resourceUrl: {
      type: String,
      default: "",
    },

    kind: {
      type: String,
      enum: ["problem", "concept"],
      default: "problem",
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

// Each multikey field needs its own index (companies and sheets are arrays).
questionSchema.index({ topic: 1, isActive: 1, difficulty: 1, title: 1 });
questionSchema.index({ companies: 1, isActive: 1, difficulty: 1, title: 1 });
questionSchema.index({ sheets: 1, isActive: 1, difficulty: 1, title: 1 });

questionSchema.pre("validate", function () {
  if (!this.leetcodeUrl && !this.gfgUrl && !this.resourceUrl) {
    throw new Error("A question needs a practice or study resource");
  }
});

module.exports = mongoose.model("Question", questionSchema);
