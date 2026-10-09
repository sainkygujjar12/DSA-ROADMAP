const mongoose = require("mongoose");

const sheetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      default: "",
    },

    author: {
      type: String,
      default: "",
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    sourceUrl: { type: String, default: "" },
    archiveUrl: { type: String, default: "" },
    sourceNote: { type: String, default: "" },
    sourceRevision: { type: String, default: "" },
    entries: [{
      _id: false,
      order: { type: Number, required: true },
      title: { type: String, required: true },
      section: { type: String, required: true },
      kind: { type: String, enum: ["problem", "concept"], default: "problem" },
      resourceUrl: { type: String, required: true },
      sourceUrl: { type: String, default: "" },
      question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    }],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sheet", sheetSchema);
