const adminQuestionService = require("../services/adminQuestion.service");

// ======================================
// Get All Questions
// ======================================

exports.getAllQuestions = async (req, res) => {
  try {
    const result = await adminQuestionService.getQuestions(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================
// Get Single Question
// ======================================

exports.getQuestion = async (req, res) => {
  try {
    const question = await adminQuestionService.getQuestion(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================
// Create Question
// ======================================

exports.createQuestion = async (req, res) => {
  try {
    const question = await adminQuestionService.createQuestion(
      req.body
    );

    return res.status(201).json({
      success: true,
      data: question,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================
// Update Question
// ======================================

exports.updateQuestion = async (req, res) => {
  try {
    const question = await adminQuestionService.updateQuestion(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================
// Delete Question
// ======================================

exports.deleteQuestion = async (req, res) => {
  try {
    await adminQuestionService.deleteQuestion(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================
// Bulk Import Questions
// ======================================

exports.bulkImportQuestions = async (req, res) => {
  try {
    const items = req.body.questions;

    const result = await adminQuestionService.bulkImportQuestions(
      items
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error(err);

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};