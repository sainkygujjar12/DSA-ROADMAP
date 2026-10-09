const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const validation = require('../src/utils/authValidation');
process.env.JWT_SECRET = 'test-secret-used-only-for-tests-123456789';
const id = '507f1f77bcf86cd799439011';
function load(relative, mocks) {
  const file = path.resolve(__dirname, relative);
  const exports = {};
  const context = { exports, module: { exports }, process, console, Buffer, Date, require: name => mocks[name] || require(name.startsWith('.') ? path.resolve(path.dirname(file), name) : name) };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context);
  return context.module.exports;
}
async function authorize(payload, user) {
  const middleware = load('../src/middleware/auth.middleware.js', { '../models/User': { findById: () => ({ select: () => ({ lean: async () => user }) }) } });
  const req = { headers: { authorization: `Bearer ${jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' })}` } };
  let status; let passed = false;
  const res = { status(code) { status = code; return this; }, json() {} };
  await middleware.protect(req, res, () => { passed = true; });
  return { passed, status, user: req.user };
}
test('password-reset and legacy unscoped tokens cannot authenticate sessions', async () => {
  for (const purpose of ['password_reset', undefined]) {
    const result = await authorize({ id, purpose }, { _id: id, isVerified: true, role: 'admin' });
    assert.equal(result.status, 401); assert.equal(result.passed, false);
  }
});
test('role comes from database, not from JWT', async () => {
  const result = await authorize({ id, purpose: 'session', role: 'admin', version: 0 }, { _id: id, isVerified: true, role: 'user', tokenVersion: 0 });
  assert.equal(result.passed, true); assert.equal(result.user.role, 'user');
});
test('verified owner is admin and another stored admin role cannot grant access', async () => {
  const { OWNER_EMAIL } = require('../src/config/admin');
  const owner = await authorize({ id, purpose: 'session', version: 0 }, { _id: id, email: OWNER_EMAIL, isVerified: true, role: 'user' });
  assert.equal(owner.passed, true);
  assert.equal(owner.user.role, 'admin');
  const other = await authorize({ id, purpose: 'session', version: 0 }, { _id: id, email: 'other@example.com', isVerified: true, role: 'admin' });
  assert.equal(other.passed, true);
  assert.equal(other.user.role, 'user');
});
test('deleted, unverified, and revoked accounts are denied', async () => {
  for (const user of [null, { _id: id, isVerified: false }, { _id: id, isVerified: true, tokenVersion: 2 }]) {
    assert.equal((await authorize({ id, purpose: 'session', version: 0 }, user)).status, 401);
  }
});
test('missing OTPs and object-valued inputs are rejected', () => {
  for (const value of [undefined, null, '', 123456, '12345', {}, { $ne: null }]) assert.throws(() => validation.otp(value));
  assert.throws(() => validation.email({ $ne: null }));
  assert.throws(() => validation.password('1234567'));
  assert.throws(() => validation.password('😀'.repeat(20)));
  assert.equal(validation.email(' Person@Example.COM '), 'person@example.com');
});
test('missing reset code is rejected before querying database', async () => {
  const service = load('../src/services/auth.service.js', { '../models/User': { findOneAndUpdate() { throw new Error('Database must not be called'); } }, '../utils/sendEmail': {} });
  await assert.rejects(service.verifyResetOtp('person@example.com', undefined), /six-digit/);
});
test('reset tokens are consumed atomically and cannot be replayed', async () => {
  let used = false;
  const service = load('../src/services/auth.service.js', {
    '../models/User': { async findOneAndUpdate(filter, update) {
      assert.equal(filter.resetTokenHash, validation.digest('nonce'));
      assert.ok(filter.resetTokenExpiry.$gt instanceof Date);
      assert.equal(update.$inc.tokenVersion, 1);
      assert.ok(Object.hasOwn(update.$unset, 'resetTokenHash'));
      if (used) return null;
      used = true; return { _id: id };
    } }, bcryptjs: { hash: async () => 'hashed-password' }, '../utils/sendEmail': {},
  });
  const token = jwt.sign({ id, purpose: 'password_reset', nonce: 'nonce', version: 0 }, process.env.JWT_SECRET, { expiresIn: '5m' });
  await service.confirmResetPassword(token, 'new-secure-password');
  await assert.rejects(service.confirmResetPassword(token, 'another-password'), /already been used/);
});
test('OTP verification enforces purpose, expiry, and attempt limit', async () => {
  const service = load('../src/services/auth.service.js', {
    '../models/User': { findOneAndUpdate(filter, update) {
      assert.equal(filter.otpPurpose, 'reset'); assert.equal(filter.otpAttempts.$lt, 5);
      assert.ok(filter.otpExpiry.$gt instanceof Date); assert.equal(update.$inc.otpAttempts, 1);
      return { select: async () => null };
    } }, '../utils/sendEmail': {},
  });
  await assert.rejects(service.verifyResetOtp('person@example.com', '123456'), /Invalid or expired/);
});
test('production refuses incomplete environment', () => {
  const validate = require('../src/config/environment');
  assert.throws(() => validate({ MONGO_URI: 'test', JWT_SECRET: 'short' }));
  assert.throws(() => validate({ NODE_ENV: 'production', MONGO_URI: 'test', JWT_SECRET: 'x'.repeat(32) }));
  const valid = { MONGO_URI: 'test', JWT_SECRET: 'x'.repeat(32) };
  for (const value of ['true', '-1', '1.5', 'NaN']) assert.throws(() => validate({ ...valid, TRUST_PROXY_HOPS: value }));
  for (const value of ['abc', '0', '70000']) assert.throws(() => validate({ ...valid, PORT: value }));
  assert.doesNotThrow(() => validate({ ...valid, PORT: '8000', TRUST_PROXY_HOPS: '1' }));
});
test('Google login refuses missing audience and unsafe third-party email linking', async () => {
  const previous = process.env.GOOGLE_CLIENT_ID;
  let verified = false;
  const service = load('../src/services/auth.service.js', {
    'google-auth-library': { OAuth2Client: class { async verifyIdToken(options) {
      verified = true;
      assert.equal(options.audience, 'configured-client-id');
      return { getPayload: () => ({ sub: 'google-subject', email: 'person@example.com', email_verified: true }) };
    } } },
    '../models/User': { findOne: () => ({ select: async () => ({ email: 'person@example.com', isVerified: true }) }) },
    '../utils/sendEmail': {},
  });
  try {
    delete process.env.GOOGLE_CLIENT_ID;
    await assert.rejects(service.googleAuthUser('token'), /not configured/);
    assert.equal(verified, false);
    process.env.GOOGLE_CLIENT_ID = 'configured-client-id';
    await assert.rejects(service.googleAuthUser('token'), /existing email and password/);
  } finally {
    if (previous === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = previous;
  }
});
test('password changes atomically revoke outstanding reset codes and concurrent changes', async () => {
  let changed = false;
  const controller = load('../src/controllers/auth.controller.js', {
    '../services/auth.service': {}, '../models/Progress': {},
    '../models/User': {
      findById: () => ({ select: async () => ({ _id: id, password: 'original-hash', tokenVersion: 0 }) }),
      async findOneAndUpdate(filter, update) {
        assert.equal(filter.password, 'original-hash');
        assert.equal(update.$inc.tokenVersion, 1);
        for (const field of ['otp', 'otpExpiry', 'otpPurpose', 'otpAttempts', 'otpSentAt', 'resetTokenHash', 'resetTokenExpiry']) assert.ok(Object.hasOwn(update.$unset, field));
        if (changed) return null;
        changed = true;
        return { _id: id };
      },
    },
    bcryptjs: { compare: async () => true, hash: async () => 'new-hash' },
  });
  const statuses = [];
  const res = { status(code) { statuses.push(code); return this; }, json() {} };
  const req = { user: { id }, body: { currentPassword: 'old-password', newPassword: 'new-password' } };
  await controller.changePassword(req, res);
  await controller.changePassword(req, res);
  assert.deepEqual(statuses, [200, 409]);
});
test('search escapes regex and bounds pagination', () => {
  const query = require('../src/utils/queryValidation');
  assert.equal(query.escapeRegex('a.*(b)'), 'a\\.\\*\\(b\\)');
  assert.equal(query.pageSize('999999'), 100); assert.equal(query.pageSize('-2'), 1); assert.equal(query.pageNumber('invalid'), 1);
});
