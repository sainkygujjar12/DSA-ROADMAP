const express = require("express");

const router = express.Router();

const {
  getUsers,
  updateRole,
  deleteUser,
} = require("../controllers/user.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const {
  adminOnly,
} = require("../middleware/admin.middleware");

router.get(
  "/",
  protect,
  adminOnly,
  getUsers
);

router.put(
  "/:id/role",
  protect,
  adminOnly,
  updateRole
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteUser
);

module.exports = router;