const User = require("../models/User");
const { effectiveRole, isOwnerEmail } = require("../config/admin");

// =============================
// Get All Users
// =============================

exports.getUsers = async () => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });
  return users.map(user => ({ ...user.toObject(), role: effectiveRole(user), isOwner: isOwnerEmail(user.email) }));
};

// =============================
// Update User Role
// =============================

exports.updateUserRole = async (
  id,
  role
) => {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');
  if (role !== effectiveRole(user)) throw new Error('Admin access is reserved for the verified owner account');
  return await User.findByIdAndUpdate(
    id,
    { role },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  ).select("-password");
};

// =============================
// Delete User
// =============================

exports.deleteUser = async (id) => {
  const user = await User.findById(id);
  if (user && isOwnerEmail(user.email)) throw new Error('The owner account cannot be deleted here');
  return await User.findByIdAndDelete(id);
};
