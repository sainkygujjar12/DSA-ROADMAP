const {
  getRoadmap,
} = require("../services/roadmap.service");

exports.getRoadmap = async (req, res) => {
  try {
    const data = await getRoadmap();

    res.status(200).json({
      success: true,
      message: "Roadmap fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};