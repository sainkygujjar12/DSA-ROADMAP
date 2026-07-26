const express = require("express");

const router = express.Router();

const {
  getAllSheets,
  getSheet,
  createSheet,
  updateSheet,
  deleteSheet,
} = require("../controllers/sheet.controller");

const {
  protect,
  optionalAuth,
} = require("../middleware/auth.middleware");

const {
  adminOnly,
} = require("../middleware/admin.middleware");

// Public
router.get("/", getAllSheets);
router.get("/:slug", optionalAuth, getSheet);

// Admin
router.post(
  "/",
  protect,
  adminOnly,
  createSheet
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateSheet
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteSheet
);

module.exports = router;