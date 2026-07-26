const express = require("express");

const router = express.Router();

const {
  getAllCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} = require("../controllers/company.controller");

const {
  protect,
  optionalAuth,
} = require("../middleware/auth.middleware");

const {
  adminOnly,
} = require("../middleware/admin.middleware");

// ======================================
// Public Routes
// ======================================

router.get("/", getAllCompanies);

router.get("/:slug", optionalAuth, getCompany);

// ======================================
// Admin Routes
// ======================================

router.post(
  "/",
  protect,
  adminOnly,
  createCompany
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateCompany
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCompany
);

module.exports = router;