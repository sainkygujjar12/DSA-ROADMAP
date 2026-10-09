const { effectiveRole } = require('../config/admin');
// Use the same session validator, including verification and revocation checks.
exports.protect = require('./auth.middleware').protect;
exports.adminOnly = (req, res, next) => {
  if (effectiveRole(req.user) !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Owner only.' });
  }
  next();
};
