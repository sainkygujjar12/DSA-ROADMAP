const express = require("express");
const router = express.Router();

const topicController = require("../controllers/topic.controller");
const {
  protect,
  optionalAuth,
} = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/admin.middleware");

// ==============================
// GET ALL TOPICS + CREATE TOPIC
// ==============================
router
  .route("/")
  .get(optionalAuth, topicController.getAllTopics)
  .post(protect, adminOnly, topicController.createTopic);

// ==============================
// GET SINGLE TOPIC BY SLUG
// ==============================
router.get("/:slug", optionalAuth, topicController.getSingleTopic);

// ==============================
// UPDATE + DELETE TOPIC (BY ID)
// ==============================
router
  .route("/:id")
  .put(protect, adminOnly, topicController.updateTopic)
  .delete(protect, adminOnly, topicController.deleteTopic);

module.exports = router;
