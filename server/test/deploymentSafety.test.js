const test = require('node:test');
const assert = require('node:assert/strict');
const { effectiveRole, OWNER_EMAIL } = require('../src/config/admin');
const { adminOnly } = require('../src/middleware/admin.middleware');
const validateEnvironment = require('../src/config/environment');

test('only the verified exact owner email grants admin, even with a forged stored role', () => {
  assert.equal(effectiveRole({ email: OWNER_EMAIL, isVerified: true, role: 'user' }), 'admin');
  for (const user of [undefined, { email: OWNER_EMAIL, isVerified: false, role: 'admin' },
    { email: 'other@gmail.com', isVerified: true, role: 'admin' },
    { email: 'sainkygurjar12+alias@gmail.com', isVerified: true, role: 'admin' }]) {
    assert.equal(effectiveRole(user), 'user');
    let status, called = false;
    adminOnly({ user }, { status(code) { status = code; return this; }, json() {} }, () => { called = true; });
    assert.equal(status, 403);
    assert.equal(called, false);
  }
});

test('SMTP2GO production config requires sender/key and bounds database pool size', () => {
  const env = { NODE_ENV: 'production', MONGO_URI: 'test', JWT_SECRET: 'x'.repeat(32), CLIENT_URL: 'https://example.com', EMAIL_PROVIDER: 'smtp2go', SMTP2GO_API_KEY: 'test-only', EMAIL_FROM: 'sender@example.com' };
  assert.doesNotThrow(() => validateEnvironment(env));
  for (const change of [{ SMTP2GO_API_KEY: '' }, { EMAIL_FROM: 'bad sender' }, { EMAIL_PROVIDER: 'typo' }, { MONGO_MAX_POOL_SIZE: '0' }, { MONGO_MAX_POOL_SIZE: '101' }]) {
    assert.throws(() => validateEnvironment({ ...env, ...change }));
  }
});

test('HTTPS email succeeds without SMTP and provider failures never become mocked success', async () => {
  const previous = { EMAIL_PROVIDER: process.env.EMAIL_PROVIDER, SMTP2GO_API_KEY: process.env.SMTP2GO_API_KEY, EMAIL_FROM: process.env.EMAIL_FROM };
  const originalFetch = global.fetch;
  Object.assign(process.env, { EMAIL_PROVIDER: 'smtp2go', SMTP2GO_API_KEY: 'test-secret', EMAIL_FROM: 'sender@example.com' });
  const { sendEmail } = require('../src/utils/sendEmail');
  try {
    global.fetch = async (url, options) => {
      assert.equal(url, 'https://api.smtp2go.com/v3/email/send');
      assert.equal(options.headers['X-Smtp2go-Api-Key'], 'test-secret');
      const body = JSON.parse(options.body);
      assert.equal(body.sender, 'DSA Roadmap <sender@example.com>');
      assert.equal(body.to[0], 'recipient@example.com');
      assert.equal(body.html_body, '<p>Test</p>');
      assert.equal(body.fastaccept, false);
      return Response.json({ data: { succeeded: 1, failed: 0, failures: [] } });
    };
    assert.deepEqual(await sendEmail({ to: 'recipient@example.com', subject: 'Test', html: '<p>Test</p>' }), { success: true, mocked: false });
    for (const status of [401, 429, 500]) {
      global.fetch = async () => new Response('private provider detail', { status });
      await assert.rejects(sendEmail({ to: 'recipient@example.com' }), error => /temporarily unavailable/.test(error.message) && !error.message.includes('private'));
    }
    for (const data of [null, {}, { succeeded: 0, failed: 1, failures: ['private provider detail'] }, { succeeded: 1, failed: 0, error: 'private provider detail' }]) {
      global.fetch = async () => Response.json({ data });
      await assert.rejects(sendEmail({ to: 'recipient@example.com' }), /temporarily unavailable/);
    }
    global.fetch = async () => new Response('not JSON');
    await assert.rejects(sendEmail({ to: 'recipient@example.com' }), /temporarily unavailable/);
    global.fetch = async () => { throw new Error('timeout with private provider detail'); };
    await assert.rejects(sendEmail({ to: 'recipient@example.com' }), /temporarily unavailable/);
  } finally {
    global.fetch = originalFetch;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
