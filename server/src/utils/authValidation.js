const crypto = require('node:crypto');
exports.email = value => {
  if (typeof value !== 'string' || value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) throw new Error('Enter a valid email address');
  return value.trim().toLowerCase();
};
exports.password = value => {
  if (typeof value !== 'string' || value.length < 8 || Buffer.byteLength(value, 'utf8') > 72) throw new Error('Password must be at least 8 characters and at most 72 UTF-8 bytes');
  return value;
};
exports.otp = value => {
  if (typeof value !== 'string' || !/^\d{6}$/.test(value)) throw new Error('Enter a valid six-digit code');
  return value;
};
exports.digest = value => crypto.createHmac('sha256', process.env.JWT_SECRET).update(value).digest('hex');
exports.generateOtp = () => crypto.randomInt(100000, 1000000).toString();
