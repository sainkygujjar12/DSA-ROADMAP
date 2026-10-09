const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { createHash } = require('node:crypto');
const windowMs = 15 * 60 * 1000;
const common = { windowMs, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' } };
const ipKey = req => ipKeyGenerator(req.ip);

// A coarse network guard runs before JWT/database work. Signed-in people on
// shared Wi-Fi then have separate budgets based on their verified session.
exports.edgeLimiter = rateLimit({ ...common, limit: 6000, keyGenerator: ipKey,
  skip: req => req.path === '/health' });
exports.userLimiter = rateLimit({ ...common, limit: 300,
  skip: req => !req.user,
  keyGenerator: req => `user:${req.user.id}` });

const networkAuth = rateLimit({ ...common, limit: 1000, keyGenerator: ipKey });
const accountAuth = rateLimit({ ...common, limit: 20, keyGenerator: req => {
  if (req.user) return `user:${req.user.id}`;
  if (typeof req.body?.email === 'string' && req.body.email.length <= 254) {
    return `email:${createHash('sha256').update(req.body.email.trim().toLowerCase()).digest('hex')}`;
  }
  // Google credentials/reset tokens have no trusted identity until validated.
  // They use the coarse network budget, not a 20-person campus-wide lockout.
  return `network:${ipKey(req)}`;
}, skip: req => !req.user && typeof req.body?.email !== 'string' });
exports.authLimiter = (req, res, next) => {
  if (req.method === 'GET' || req.path === '/logout' || req.path === '/update-profile') return next();
  networkAuth(req, res, () => accountAuth(req, res, next));
};
