const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { sendOtpEmail, sendResetPasswordOtpEmail } = require("../utils/sendEmail");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const signToken = (user, purpose = "session", expiresIn = "7d") =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      purpose,
    },
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  );

exports.registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser && existingUser.isVerified) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  let user;

  if (existingUser && !existingUser.isVerified) {
    existingUser.name = name;
    existingUser.password = hashedPassword;
    existingUser.otp = otp;
    existingUser.otpExpiry = otpExpiry;
    await existingUser.save();
    user = existingUser;
  } else {
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
    });
  }

  await sendOtpEmail(email, name, otp);

  return user;
};

exports.verifyOtpAndActivate = async (email, otp) => {
  const user = await User.findOne({ email }).select(
    "+otp +otpExpiry"
  );

  if (!user) {
    throw new Error("No account found for this email");
  }

  if (user.isVerified) {
    throw new Error("Account is already verified");
  }

  if (!user.otp || user.otp !== otp) {
    throw new Error("Invalid verification code");
  }

  if (!user.otpExpiry || user.otpExpiry < new Date()) {
    throw new Error(
      "This code has expired. Please request a new one."
    );
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const token = signToken(user);

  return { user, token };
};

exports.resendOtp = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("No account found for this email");
  }

  if (user.isVerified) {
    throw new Error("Account is already verified");
  }

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendOtpEmail(email, user.name, otp);
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.password) {
    throw new Error(
      "This account uses Google Sign-In. Please continue with Google instead."
    );
  }

  if (!user.isVerified) {
    throw new Error(
      "Please verify your email before logging in. Check your inbox for the verification code."
    );
  }

  const isMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = signToken(user);

  return {
    user,
    token,
  };
};

exports.googleAuthUser = async (idToken) => {
  if (!idToken) {
    throw new Error("Missing Google credential");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new Error("Invalid Google credential");
  }

  const { sub: googleId, email, name, picture } = payload;

  if (!email) {
    throw new Error("Google account has no email");
  }

  let user = await User.findOne({ googleId });

  if (!user) {
    user = await User.findOne({ email });

    if (user) {
      user.googleId = googleId;
      user.authProvider = "google";
      user.isVerified = true;
      if (!user.avatar) user.avatar = picture || "";
      await user.save();
    } else {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
        authProvider: "google",
        avatar: picture || "",
        isVerified: true,
      });
    }
  }

  const token = signToken(user);

  return {
    user,
    token,
  };
};

// ======================================
// Password Reset Flow
// ======================================

exports.forgetPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    // For security, don't reveal if the email exists
    return { message: "If an account exists with this email, a reset code has been sent." };
  }

  if (user.authProvider === "google") {
    throw new Error("This account uses Google Sign-In. Please reset your password via Google.");
  }

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendResetPasswordOtpEmail(email, user.name, otp);

  return { message: "A password reset code has been sent to your email." };
};

exports.verifyResetOtp = async (email, otp) => {
  const user = await User.findOne({ email }).select("+otp +otpExpiry");

  if (!user || user.otp !== otp || (user.otpExpiry && user.otpExpiry < new Date())) {
    throw new Error("Invalid or expired verification code");
  }

  // Issue a short-lived token specifically for password reset
  const token = signToken(user, "password_reset", "15m");

  return { token };
};

exports.confirmResetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new Error("User not found");
  }

  if (decoded.purpose !== "password_reset") {
    throw new Error("Invalid token for this operation");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  return { message: "Password has been successfully reset." };
};
