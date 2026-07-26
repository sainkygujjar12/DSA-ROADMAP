const express = require("express");

const router = express.Router();

const {
  getAllQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions,
} = require("../controllers/adminQuestion.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const {
  adminOnly,
} = require("../middleware/admin.middleware");

router.use(protect);
router.use(adminOnly);

router
  .route("/")
  .get(getAllQuestions)
  .post(createQuestion);

router.post("/bulk-import", bulkImportQuestions);

router
  .route("/:id")
  .get(getQuestion)
  .put(updateQuestion)
  .delete(deleteQuestion);

module.exports = router;