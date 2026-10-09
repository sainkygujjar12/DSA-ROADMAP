const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../scripts/authorizeGmail.js'), 'utf8');

// Run the helper with fake Google, filesystem and listener dependencies. No real
// authorization, email, credentials, files or ports are used by these tests.
async function harness({ account = 'sender@gmail.com', verified = true, permission = true, exists = false } = {}) {
  let callback, authParams, exchanged = 0, written;
  const logs = [];
  const fakeProcess = { env: { GMAIL_CLIENT_ID: 'client', GMAIL_CLIENT_SECRET: 'private-secret', EMAIL_FROM: 'sender@gmail.com' } };
  class Client {
    async generateCodeVerifierAsync() { return { codeVerifier: 'verifier', codeChallenge: 'challenge' }; }
    generateAuthUrl(params) { authParams = params; return 'https://accounts.google.com/fake'; }
    async getToken(options) {
      exchanged++;
      assert.equal(options.codeVerifier, 'verifier');
      return { tokens: { refresh_token: 'private-refresh', id_token: 'private-id',
        scope: permission ? 'openid email https://www.googleapis.com/auth/gmail.send' : 'openid email' } };
    }
    async verifyIdToken(options) {
      assert.equal(options.audience, 'client');
      return { getPayload: () => ({ email: account, email_verified: verified }) };
    }
  }
  const fakeServer = { on() {}, close() {}, listen(port, host, ready) {
    assert.equal(host, '127.0.0.1'); assert.equal(port, 53682); ready();
  } };
  const modules = { 'node:http': { createServer(handler) { callback = handler; return fakeServer; } },
    'node:crypto': require('node:crypto'), 'node:path': path,
    'node:fs/promises': { async access() { if (!exists) throw Object.assign(new Error(), { code: 'ENOENT' }); },
      async writeFile(file, contents, options) { written = { file, contents, options }; } },
    'google-auth-library': { OAuth2Client: Client }, dotenv: { config() {} } };
  const context = { require(name) { assert.ok(modules[name], name); return modules[name]; }, module: { exports: {} },
    __dirname: path.join(__dirname, '../scripts'), process: fakeProcess, URL,
    console: { log: (...args) => logs.push(args.join(' ')), error: (...args) => logs.push(args.join(' ')) },
    setTimeout: () => 1, clearTimeout() {} };
  vm.runInNewContext(source, context);
  await context.module.exports.main();
  return { get authParams() { return authParams; }, get exchanged() { return exchanged; },
    get written() { return written; }, logs, fakeProcess,
    async visit(query) {
      const response = { status: 200, setHeader() {}, writeHead(code) { this.status = code; }, end(text) { this.text = text; } };
      await callback({ method: 'GET', url: `/oauth2callback?${new URLSearchParams(query)}` }, response);
      return response;
    } };
}

test('sender authorization rejects wrong OAuth state before exchanging a code', async () => {
  const run = await harness();
  assert.equal(run.authParams.code_challenge_method, 'S256');
  assert.equal(run.authParams.access_type, 'offline');
  assert.equal((await run.visit({ state: 'wrong', code: 'code' })).status, 400);
  assert.equal(run.exchanged, 0);
  assert.equal(run.written, undefined);
});

test('sender authorization enforces verified identity, granted scope and denial', async () => {
  for (const settings of [{ account: 'other@gmail.com' }, { verified: false }, { permission: false }, { denied: true }]) {
    const run = await harness(settings);
    const query = { state: run.authParams.state, ...(settings.denied ? { error: 'access_denied' } : { code: 'code' }) };
    assert.equal((await run.visit(query)).status, 400);
    assert.equal(run.written, undefined);
    assert.equal(run.fakeProcess.exitCode, 1);
    assert.ok(!run.logs.join().includes('private-'));
  }
});

test('sender authorization saves owner-only credentials without exposing them or accepting replay', async () => {
  const run = await harness();
  const query = { state: run.authParams.state, code: 'code' };
  const response = await run.visit(query);
  assert.equal(response.status, 200);
  assert.equal(run.written.options.mode, 0o600);
  assert.equal(run.written.options.flag, 'wx');
  assert.equal(path.basename(run.written.file), '.env.gmail');
  assert.match(run.written.contents, /GMAIL_REFRESH_TOKEN="private-refresh"/);
  assert.ok(!run.logs.join().includes('private-'));
  assert.ok(!response.text.includes('private-'));
  assert.equal((await run.visit(query)).status, 400);
  assert.equal(run.exchanged, 1);
});

test('sender authorization refuses to overwrite existing credentials', async () => {
  await assert.rejects(harness({ exists: true }), /already exists/);
});
