const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { effectiveRole } = require('../config/admin');

async function authenticate(req) {
  if (req.authenticationChecked) return req.user || null;
  const header = req.headers.authorization;
  if (typeof header !== 'string' || !/^Bearer \S+$/.test(header)) return null;
  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch { return null; }
  if (decoded.purpose !== 'session' || !mongoose.isValidObjectId(decoded.id)) return null;
  const user = await User.findById(decoded.id).select('email role isVerified +tokenVersion').lean();
  if (!user?.isVerified || (decoded.version ?? 0) !== (user.tokenVersion || 0)) return null;
  return { id: String(user._id), email: user.email, isVerified: user.isVerified, role: effectiveRole(user) };
}
exports.protect = async (req, res, next) => {
  try {
    const user = await authenticate(req);
    if (!user) return res.status(401).json({ success: false, message: 'Your session has expired. Please log in again.' });
    req.user = user;
    next();
  } catch { res.status(503).json({ success: false, message: 'Authentication is temporarily unavailable.' }); }
};
exports.optionalAuth = async (req, res, next) => {
  try { req.user = await authenticate(req); req.authenticationChecked = true; }
  catch { return res.status(503).json({ success: false, message: 'Service temporarily unavailable.' }); }
  next();
};
