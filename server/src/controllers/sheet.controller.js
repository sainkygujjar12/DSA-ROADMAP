const sheetService = require("../services/sheet.service");

// ======================================
// Get All Sheets
// ======================================

exports.getAllSheets = async (req, res) => {
  try {
    const sheets =
      await sheetService.getSheets();

    res.status(200).json({
      success: true,
      count: sheets.length,
      data: sheets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Single Sheet
// ======================================

exports.getSheet = async (req, res) => {
  try {
    const sheet =
      await sheetService.getSheetBySlug(
        req.params.slug,
        req.user?.id
      );

    res.status(200).json({
      success: true,
      data: sheet,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Create Sheet
// ======================================

exports.createSheet = async (req, res) => {
  try {
    const sheet =
      await sheetService.createSheet(
        req.body
      );

    res.status(201).json({
      success: true,
      data: sheet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Sheet
// ======================================

exports.updateSheet = async (req, res) => {
  try {
    const sheet =
      await sheetService.updateSheet(
        req.params.id,
        req.body
      );

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: "Sheet not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sheet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Sheet
// ======================================

exports.deleteSheet = async (req, res) => {
  try {
    const sheet =
      await sheetService.deleteSheet(
        req.params.id
      );

    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: "Sheet not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Sheet deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
