const express = require("express");

const router = express.Router();

const {
  getDashboard,
} = require("../controllers/admin.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const {
  adminOnly,
} = require("../middleware/admin.middleware");

// ======================================
// Admin Dashboard
// ======================================

router.get(
  "/dashboard",
  protect,
  adminOnly,
  getDashboard
);

module.exports = router;