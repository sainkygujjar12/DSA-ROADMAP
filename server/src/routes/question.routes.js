const express = require("express");

const router = express.Router();

const {
  getAllQuestions,
  createQuestion,
  getQuestionsByTopic,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/question.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const {
  adminOnly,
} = require("../middleware/admin.middleware");

// Public
router.get("/", getAllQuestions);
router.get("/topic/:slug", getQuestionsByTopic);
router.get("/:slug", getQuestion);

// Admin
router.post("/", protect, adminOnly, createQuestion);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateQuestion
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteQuestion
);

module.exports = router;