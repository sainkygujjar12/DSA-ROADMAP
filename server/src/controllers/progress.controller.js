const {
  getProgress,
  getProgressSummary,
  toggleSolvedQuestion,
  updateLastVisitedQuestion,
  toggleBookmark,
  saveNotes,
  deleteNote,
} = require("../services/progress.service");

// ======================================
// Get User Progress
// ======================================

exports.getUserProgress = async (req, res) => {
  try {
    const progress = req.query.summary === 'true'
      ? await getProgressSummary(req.user.id)
      : await getProgress(req.user.id);

    return res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Toggle Solved Question
// ======================================

exports.toggleQuestionSolved = async (req, res) => {
  try {
    const progress = await toggleSolvedQuestion(
      req.user.id,
      req.params.questionId
    );

    return res.status(200).json({
      success: true,
      message: "Question status updated successfully",
      data: progress,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Last Visited Question
// ======================================

exports.updateLastVisited = async (req, res) => {
  try {
    const progress = await updateLastVisitedQuestion(
      req.user.id,
      req.params.questionId
    );

    return res.status(200).json({
      success: true,
      message: "Last visited question updated",
      data: progress,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Toggle Bookmark
// ======================================

exports.toggleBookmark = async (req, res) => {
  try {
    const progress = await toggleBookmark(
      req.user.id,
      req.params.questionId
    );

    return res.status(200).json({
      success: true,
      message: "Bookmark updated successfully",
      data: progress,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Save Notes
// ======================================

exports.saveQuestionNotes = async (req, res) => {
  try {
    const progress = await saveNotes(
      req.user.id,
      req.params.questionId,
      req.body.content
    );

    return res.status(200).json({
      success: true,
      message: "Notes saved successfully",
      data: progress,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
// ======================================
// Delete Note
// ======================================

exports.deleteQuestionNote = async (req, res) => {
  try {
    const progress = await deleteNote(
      req.user.id,
      req.params.questionId
    );

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      data: progress,
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
