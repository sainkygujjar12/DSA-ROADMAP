const {
  getDashboardStats,
} = require("../services/dashboard.service");

// ======================================
// Get Dashboard
// ======================================

exports.getDashboard = async (req, res) => {
  try {
    const dashboard = await getDashboardStats(
      req.user.id
    );

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