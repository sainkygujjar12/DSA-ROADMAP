const userService = require("../services/user.service");

// =============================
// Get All Users
// =============================

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================
// Update User Role
// =============================

exports.updateRole = async (req, res) => {
  try {
    const user =
      await userService.updateUserRole(
        req.params.id,
        req.body.role
      );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================
// Delete User
// =============================

exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};