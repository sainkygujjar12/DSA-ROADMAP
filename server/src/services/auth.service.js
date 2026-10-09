const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const { OAuth2Client } = require('google-auth-library');
const { sendOtpEmail, sendResetPasswordOtpEmail } = require('../utils/sendEmail');
const validate = require('../utils/authValidation');
const { effectiveRole } = require('../config/admin');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const resetMessage = { message: 'If an eligible account exists, a reset code has been sent.' };

const signToken = (user, purpose = 'session', expiresIn = '7d', extra = {}) => jwt.sign({
  id: user._id, purpose, version: user.tokenVersion || 0, ...extra,
}, process.env.JWT_SECRET, { expiresIn, algorithm: 'HS256' });

async function sendCode(user, purpose) {
  // Account-level cooldown prevents resend abuse across IP addresses.
  if (user.otpSentAt && Date.now() - new Date(user.otpSentAt).getTime() < 60000) throw new Error('Please wait one minute before requesting another code');
  const otp = validate.generateOtp();
  user.otp = validate.digest(`${purpose}:${user.email}:${otp}`);
  user.otpPurpose = purpose;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  user.otpSentAt = new Date();
  user.resetTokenHash = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  try {
    await (purpose === 'verify' ? sendOtpEmail : sendResetPasswordOtpEmail)(user.email, user.name, otp);
  } catch (error) {
    await User.updateOne({ _id: user._id, otp: user.otp }, { $unset: { otp: '', otpExpiry: '', otpSentAt: '', otpPurpose: '' } });
    throw error;
  }
}

async function consumeCode(email, otp, purpose) {
  email = validate.email(email);
  validate.otp(otp);
  // Reserve an attempt atomically, including incorrect attempts.
  const user = await User.findOneAndUpdate({ email, otpPurpose: purpose, otpExpiry: { $gt: new Date() }, otpAttempts: { $lt: 5 } },
    { $inc: { otpAttempts: 1 } }, { returnDocument: 'after' }).select('+otp +otpExpiry +tokenVersion');
  const expected = validate.digest(`${purpose}:${email}:${otp}`);
  if (!user || !user.otp || user.otp !== expected) throw new Error('Invalid or expired verification code');
  const consumed = await User.updateOne({ _id: user._id, otp: expected, otpPurpose: purpose },
    { $unset: { otp: '', otpExpiry: '', otpPurpose: '' } });
  if (consumed.modifiedCount !== 1) throw new Error('This code has already been used');
  return user;
}

exports.registerUser = async ({ name, email, password } = {}) => {
  email = validate.email(email);
  validate.password(password);
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) throw new Error('Name must contain 1–80 characters');
  let user = await User.findOne({ email }).select('+otpSentAt');
  if (user?.isVerified) throw new Error('An account with this email already exists');
  if (user?.otpSentAt && Date.now() - user.otpSentAt.getTime() < 60000) throw new Error('Please wait one minute before trying again');
  const hashedPassword = await bcrypt.hash(password, 12);
  if (user) { user.name = name.trim(); user.password = hashedPassword; }
  else user = new User({ name: name.trim(), email, password: hashedPassword });
  await sendCode(user, 'verify');
  return user;
};
exports.verifyOtpAndActivate = async (email, otp) => {
  const user = await consumeCode(email, otp, 'verify');
  user.isVerified = true;
  user.role = effectiveRole(user);
  await User.updateOne({ _id: user._id }, { $set: { isVerified: true, role: user.role } });
  return { user, token: signToken(user) };
};
exports.resendOtp = async email => {
  const user = await User.findOne({ email: validate.email(email), isVerified: false }).select('+otpSentAt');
  if (user) await sendCode(user, 'verify');
};
exports.loginUser = async ({ email, password } = {}) => {
  email = validate.email(email);
  if (typeof password !== 'string' || Buffer.byteLength(password) > 72) throw new Error('Invalid email or password');
  const user = await User.findOne({ email }).select('+password +tokenVersion');
  if (!user?.password || !(await bcrypt.compare(password, user.password))) throw new Error('Invalid email or password');
  if (!user.isVerified) throw new Error('Please verify your email before logging in');
  await syncRole(user);
  return { user, token: signToken(user) };
};
exports.googleAuthUser = async credential => {
  if (!process.env.GOOGLE_CLIENT_ID?.trim()) throw new Error('Google sign-in is not configured');
  if (typeof credential !== 'string' || credential.length > 10000) throw new Error('Invalid Google credential');
  let payload;
  try { payload = (await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID })).getPayload(); }
  catch { throw new Error('Invalid Google credential'); }
  if (!payload?.email_verified || !payload.sub) throw new Error('Google email must be verified');
  const email = validate.email(payload.email);
  let user = await User.findOne({ email }).select('+tokenVersion');
  if (user) {
    if (user.googleId && user.googleId !== payload.sub) throw new Error('Google account does not match');
    // Google is not authoritative for third-party email addresses. Never
    // auto-link one to an existing account without that account's credentials.
    if (!user.googleId && !email.endsWith('@gmail.com') && !payload.hd) {
      throw new Error('Sign in with your existing email and password. Use password reset if needed.');
    }
    if (!user.isVerified) {
      user.password = undefined;
      user.authProvider = 'google';
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      user.otp = undefined;
      user.otpExpiry = undefined;
      user.otpPurpose = undefined;
    }
    user.googleId = payload.sub;
    user.isVerified = true;
    if (!user.avatar) user.avatar = payload.picture || '';
    await user.save();
  } else user = await User.create({ name: payload.name || email.split('@')[0], email, googleId: payload.sub, authProvider: 'google', isVerified: true, avatar: payload.picture || '' });
  await syncRole(user);
  return { user, token: signToken(user) };
};
exports.forgetPassword = async email => {
  const user = await User.findOne({ email: validate.email(email), isVerified: true, authProvider: 'local' }).select('+otpSentAt');
  if (user) {
    if (user.otpSentAt && Date.now() - user.otpSentAt.getTime() < 60000) return resetMessage;
    await sendCode(user, 'reset');
  }
  return resetMessage;
};
exports.verifyResetOtp = async (email, otp) => {
  const user = await consumeCode(email, otp, 'reset');
  const nonce = crypto.randomBytes(32).toString('hex');
  await User.updateOne({ _id: user._id }, { $set: { resetTokenHash: validate.digest(nonce), resetTokenExpiry: new Date(Date.now() + 15 * 60 * 1000) } });
  return { token: signToken(user, 'password_reset', '15m', { nonce }) };
};
exports.confirmResetPassword = async (token, newPassword) => {
  validate.password(newPassword);
  const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  if (decoded.purpose !== 'password_reset' || typeof decoded.nonce !== 'string') throw new Error('Invalid reset token');
  const password = await bcrypt.hash(newPassword, 12);
  const user = await User.findOneAndUpdate({ _id: decoded.id, $or: [{ tokenVersion: decoded.version }, ...(decoded.version === 0 ? [{ tokenVersion: { $exists: false } }] : [])], resetTokenHash: validate.digest(decoded.nonce), resetTokenExpiry: { $gt: new Date() } }, {
    $set: { password }, $inc: { tokenVersion: 1 },
    $unset: { resetTokenHash: '', resetTokenExpiry: '', otp: '', otpExpiry: '', otpPurpose: '' },
  });
  if (!user) throw new Error('This reset link has expired or has already been used');
  return { message: 'Password reset. Please log in again.' };
};

async function syncRole(user) {
  const role = effectiveRole(user);
  if (user.role !== role) {
    await User.updateOne({ _id: user._id }, { $set: { role } });
    user.role = role;
  }
}
