const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  googleLogin,
  updateProfile,
  changePassword,
  verifyOtp,
  resendOtp,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth.middleware");

// ==============================
// REGISTER
// ==============================
router.post("/register", register);

// ==============================
// VERIFY OTP
// ==============================
router.post("/verify-otp", verifyOtp);

// ==============================
// RESEND OTP
// ==============================
router.post("/resend-otp", resendOtp);

// ==============================
// LOGIN
// ==============================
router.post("/login", login);

// ==============================
// GOOGLE SIGN-IN
// ==============================
router.post("/google", googleLogin);

// ==============================
// LOGOUT
// ==============================
router.post("/logout", logout);

// ==============================
// GET PROFILE (ME)
// ==============================
router.get("/me", protect, getMe);

// ==============================
// UPDATE PROFILE
// ==============================
router.put("/update-profile", protect, updateProfile);

// ==============================
// CHANGE PASSWORD
// ==============================
router.put("/change-password", protect, changePassword);

module.exports = router;