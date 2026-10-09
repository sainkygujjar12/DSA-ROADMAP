const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
router.param("questionId", (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid question ID" });
  next();
});

const {
  getUserProgress,
  toggleQuestionSolved,
  updateLastVisited,
  toggleBookmark,
  saveQuestionNotes,
  deleteQuestionNote,
} = require("../controllers/progress.controller");

const { protect } = require("../middleware/auth.middleware");

// ======================================
// Get Progress
// ======================================

router.get(
  "/",
  protect,
  getUserProgress
);

// ======================================
// Toggle Solved
// ======================================

router.patch(
  "/toggle/:questionId",
  protect,
  toggleQuestionSolved
);

// ======================================
// Toggle Bookmark
// ======================================

router.patch(
  "/bookmark/:questionId",
  protect,
  toggleBookmark
);

// ======================================
// Save Notes
// ======================================

router.patch(
  "/note/:questionId",
  protect,
  saveQuestionNotes
);
// ======================================
// Delete Note
// ======================================

router.delete(
  "/note/:questionId",
  protect,
  deleteQuestionNote
);

// ======================================
// Update Last Visited
// ======================================

router.patch(
  "/last-visited/:questionId",
  protect,
  updateLastVisited
);

module.exports = router;