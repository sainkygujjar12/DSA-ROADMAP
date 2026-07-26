const express = require("express");

const router = express.Router();

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