const express = require("express");
const router = express.Router();

const topicController = require("../controllers/topic.controller");
const { optionalAuth } = require("../middleware/auth.middleware");

// ==============================
// GET ALL TOPICS + CREATE TOPIC
// ==============================
router
  .route("/")
  .get(topicController.getAllTopics)
  .post(topicController.createTopic);

// ==============================
// GET SINGLE TOPIC BY SLUG
// ==============================
router.get("/:slug", optionalAuth, topicController.getSingleTopic);

// ==============================
// UPDATE + DELETE TOPIC (BY ID)
// ==============================
router
  .route("/:id")
  .put(topicController.updateTopic)
  .delete(topicController.deleteTopic);

module.exports = router;