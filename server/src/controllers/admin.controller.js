const {
  getAdminStats,
} = require("../services/admin.service");

// ======================================
// Get Admin Dashboard
// ======================================

exports.getDashboard = async (req, res) => {
  try {
    const dashboard =
      await getAdminStats();

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};