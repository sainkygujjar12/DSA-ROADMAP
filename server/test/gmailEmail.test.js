const test = require('node:test');
const assert = require('node:assert/strict');
const { createGmailSender } = require('../src/utils/gmailEmail');
const validateEnvironment = require('../src/config/environment');
const config = { clientId: 'test-client', clientSecret: 'private-secret', refreshToken: 'private-refresh', from: 'sender@gmail.com' };
const message = { to: 'recipient@example.com', subject: 'Verify ✓', html: '<p>Your code: 123456</p>' };
const tokenResponse = () => Response.json({ access_token: 'private-access', token_type: 'Bearer', expires_in: 3600 });

test('Gmail production requires all sender credentials independently of Google login', () => {
  const env = { NODE_ENV: 'production', MONGO_URI: 'test', JWT_SECRET: 'x'.repeat(32), CLIENT_URL: 'https://example.com',
    EMAIL_PROVIDER: 'gmail', GMAIL_CLIENT_ID: config.clientId, GMAIL_CLIENT_SECRET: config.clientSecret,
    GMAIL_REFRESH_TOKEN: config.refreshToken, EMAIL_FROM: config.from };
  assert.doesNotThrow(() => validateEnvironment(env));
  for (const key of ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN', 'EMAIL_FROM']) {
    assert.throws(() => validateEnvironment({ ...env, [key]: '', GOOGLE_CLIENT_ID: 'login-client' }), new RegExp(key));
  }
  assert.throws(() => validateEnvironment({ ...env, EMAIL_FROM: 'sender@gmail.com\r\nBcc: other@example.com' }));
});

test('Gmail composes MIME and refreshes once for concurrent sends, reusing tokens until expiry', async () => {
  let refreshes = 0, sends = 0, now = 1000000;
  const send = createGmailSender(config, async (url, options) => {
    assert.ok(options.signal instanceof AbortSignal);
    if (url === 'https://oauth2.googleapis.com/token') {
      refreshes++;
      assert.equal(options.body.get('grant_type'), 'refresh_token');
      assert.equal(options.body.get('client_secret'), config.clientSecret);
      assert.equal(options.body.get('refresh_token'), config.refreshToken);
      await new Promise(resolve => setTimeout(resolve, 10));
      return tokenResponse();
    }
    assert.equal(url, 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send');
    assert.equal(options.headers.authorization, 'Bearer private-access');
    const raw = JSON.parse(options.body).raw;
    assert.match(raw, /^[A-Za-z0-9_-]+$/);
    const mime = Buffer.from(raw, 'base64url').toString();
    assert.match(mime, /From: DSA Roadmap <sender@gmail.com>/);
    assert.match(mime, /To: recipient@example.com/);
    assert.match(mime, /Content-Type: text\/html; charset=utf-8/);
    assert.match(mime, /123456/);
    assert.match(mime, /Subject: =\?UTF-8\?/i);
    sends++;
    return Response.json({ id: `message-${sends}` });
  }, () => now);
  const results = await Promise.all(Array.from({ length: 20 }, () => send(message)));
  assert.equal(refreshes, 1);
  assert.equal(sends, 20);
  assert.deepEqual(results[0], { success: true, mocked: false });
  await send(message);
  assert.equal(refreshes, 1);
  now += 3600000;
  await send(message);
  assert.equal(refreshes, 2);
});

test('Gmail rejects missing credentials and recipient header injection before any request', async () => {
  const request = () => { assert.fail('Should not call network'); };
  for (const key of Object.keys(config)) await assert.rejects(createGmailSender({ ...config, [key]: '' }, request)(message), /temporarily unavailable/);
  for (const to of ['a@example.com\r\nBcc: b@example.com', 'a@example.com,b@example.com']) {
    await assert.rejects(createGmailSender(config, request)({ ...message, to }), /temporarily unavailable/);
  }
});

test('Gmail refresh and send failures are sanitized and never retried or mocked', async () => {
  for (const stage of ['refresh', 'send']) {
    for (const failure of [() => new Response('private detail', { status: 400 }),
      () => new Response('private detail', { status: 401 }), () => new Response('private detail', { status: 429 }),
      () => new Response('private detail', { status: 503 }), () => Response.json({}),
      () => new Response('invalid JSON'), () => { throw new Error('private-secret timeout'); }]) {
      let failedRequests = 0;
      const send = createGmailSender(config, async url => {
        if (stage === 'send' && url.endsWith('/token')) return tokenResponse();
        failedRequests++;
        return failure();
      });
      await assert.rejects(send(message), error => error.message === 'Email service is temporarily unavailable. Please try again later.');
      assert.equal(failedRequests, 1);
    }
  }
});

test('Gmail releases failed refresh locks and invalidates rejected access tokens for the next attempt', async () => {
  let refreshes = 0, sends = 0;
  const send = createGmailSender(config, async url => {
    if (url.endsWith('/token')) {
      refreshes++;
      return refreshes === 1 ? new Response('', { status: 400 }) : tokenResponse();
    }
    sends++;
    return sends === 1 ? new Response('', { status: 401 }) : Response.json({ id: 'ok' });
  });
  await assert.rejects(send(message));
  await assert.rejects(send(message));
  assert.deepEqual(await send(message), { success: true, mocked: false });
  assert.equal(refreshes, 3);
  assert.equal(sends, 2);
});

test('configured Gmail provider is used by verification and reset emails', async () => {
  const values = { EMAIL_PROVIDER: 'gmail', GMAIL_CLIENT_ID: config.clientId, GMAIL_CLIENT_SECRET: config.clientSecret,
    GMAIL_REFRESH_TOKEN: config.refreshToken, EMAIL_FROM: config.from };
  const previous = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
  const originalFetch = global.fetch;
  let sends = 0;
  try {
    Object.assign(process.env, values);
    global.fetch = async url => {
      if (url.endsWith('/token')) return tokenResponse();
      sends++;
      return Response.json({ id: 'ok' });
    };
    const { sendOtpEmail, sendResetPasswordOtpEmail } = require('../src/utils/sendEmail');
    await sendOtpEmail(message.to, 'User', '123456');
    await sendResetPasswordOtpEmail(message.to, 'User', '654321');
    assert.equal(sends, 2);
  } finally {
    global.fetch = originalFetch;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
