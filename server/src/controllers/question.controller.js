const questionService = require("../services/question.service");

// ======================================
// Get All Questions
// ======================================

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await questionService.getQuestions();

    return res.status(200).json({
      success: true,
      message: "Questions fetched successfully",
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Questions By Topic
// ======================================

exports.getQuestionsByTopic = async (req, res) => {
  try {
    const questions =
      await questionService.getQuestionsByTopic(
        req.params.slug
      );

    return res.status(200).json({
      success: true,
      message: "Questions fetched successfully",
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Question
// ======================================

exports.getQuestion = async (req, res) => {
  try {
    const question =
      await questionService.getQuestionBySlug(
        req.params.slug
      );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Create Question
// ======================================

exports.createQuestion = async (req, res) => {
  try {
    const question =
      await questionService.createQuestion(
        req.body
      );

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question,
    });
  } catch (error) {
    console.log(
      "========== CREATE QUESTION ERROR =========="
    );
    console.log(error);

    if (error.errors) {
      console.log(error.errors);
    }

    return res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};

// ======================================
// Update Question
// ======================================

exports.updateQuestion = async (req, res) => {
  try {
    const question =
      await questionService.updateQuestion(
        req.params.id,
        req.body
      );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: question,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Question
// ======================================

exports.deleteQuestion = async (req, res) => {
  try {
    const question =
      await questionService.deleteQuestion(
        req.params.id
      );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};