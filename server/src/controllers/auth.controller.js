const {
  registerUser,
  loginUser,
  googleAuthUser,
  verifyOtpAndActivate,
  resendOtp,
  forgetPassword,
  verifyResetOtp,
  confirmResetPassword,
} = require("../services/auth.service");
const User = require("../models/User");
const Progress = require("../models/Progress");
const bcrypt = require("bcryptjs");

// ==============================
// REGISTER
// Creates an unverified account and emails a 6-digit OTP.
// Does NOT log the user in — verifyOtp does that once the
// code is confirmed.
// ==============================
exports.register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message:
        "Verification code sent. Please check your email.",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// VERIFY OTP
// ==============================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const { user, token } = await verifyOtpAndActivate(
      email,
      otp
    );

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// RESEND OTP
// ==============================
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    await resendOtp(email);

    res.status(200).json({
      success: true,
      message: "A new verification code has been sent.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// LOGIN
// ==============================
exports.login = async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GOOGLE SIGN-IN
// ==============================
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const { user, token } = await googleAuthUser(credential);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// UPDATE PROFILE (name, avatar)
// ==============================
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const updates = {};
    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }
    if (typeof avatar === "string") {
      updates.avatar = avatar;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const progress = await Progress.findOne({
      user: req.user.id,
    }).select("solvedQuestions streak");

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: {
        ...user.toObject(),
        totalSolved: progress?.solvedQuestions?.length || 0,
        streak: progress?.streak || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// CHANGE PASSWORD (local accounts only)
// ==============================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In and has no password to change.",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword || "",
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// LOGOUT
// ==============================
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// ==============================
// GET PROFILE (ME)
// ==============================
exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
    }

    const user = await User.findById(req.user.id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const progress = await Progress.findOne({
      user: req.user.id,
    }).select("solvedQuestions streak");

    const userWithLiveStats = {
      ...user.toObject(),
      totalSolved: progress?.solvedQuestions?.length || 0,
      streak: progress?.streak || 0,
    };

    res.status(200).json({
      success: true,
      data: userWithLiveStats,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==============================
// FORGET PASSWORD
// ==============================
exports.forgotPassword = async (req, res) => {
  try {
    const result = await forgetPassword(req.body);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// VERIFY RESET OTP
// ==============================
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const { token } = await verifyResetOtp(email, otp);
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// CONFIRM RESET PASSWORD
// ==============================
exports.confirmResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await confirmResetPassword(token, newPassword);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
