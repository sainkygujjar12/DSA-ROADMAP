const User = require("../models/User");

// =============================
// Get All Users
// =============================

exports.getUsers = async () => {
  return await User.find()
    .select("-password")
    .sort({ createdAt: -1 });
};

// =============================
// Update User Role
// =============================

exports.updateUserRole = async (
  id,
  role
) => {
  return await User.findByIdAndUpdate(
    id,
    { role },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password");
};

// =============================
// Delete User
// =============================

exports.deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};