const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const fs = require('node:fs');
const path = require('node:path');
process.env.NODE_ENV = 'production';
process.env.CLIENT_URL = 'https://example.com';
process.env.JWT_SECRET = 'test-secret-for-http-tests-123456789';
const app = require('../src/app');
let server, base;
test.before(async () => {
  await new Promise((resolve, reject) => { server = app.listen(0, '127.0.0.1', error => error ? reject(error) : resolve()); server.on('error', reject); });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => { if (server) await new Promise(resolve => server.close(resolve)); });
test('production serves SPA deep links with security headers', async () => {
  let response;
  for (const route of ['/profile', '/settings', '/roadmap', '/sheets/love-babbar-sheet', '/sheets/striver-sde-sheet']) {
    response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    assert.match(await response.text(), /id="root"/, route);
  }
  const csp = response.headers.get('content-security-policy');
  assert.match(csp, /script-src 'self'/);
  assert.match(csp, /fonts.googleapis.com/);
  assert.equal(response.headers.get('x-powered-by'), null);
});
test('missing assets return 404 rather than HTML', async () => {
  const response = await fetch(base + '/assets/missing-chunk.js');
  assert.equal(response.status, 404);
  assert.equal((await response.json()).success, false);
});
test('hashed assets stay cached while HTML remains revalidatable', async () => {
  const html = await fetch(base + '/');
  assert.doesNotMatch(html.headers.get('cache-control') || '', /immutable|max-age=[1-9]/);
  const assets = fs.readdirSync(path.resolve(__dirname, '../../client/dist/assets'));
  const script = assets.find(name => name.endsWith('.js'));
  const response = await fetch(base + '/assets/' + script);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /max-age=31536000/);
  assert.match(response.headers.get('cache-control'), /immutable/);
  const logo = await fetch(base + '/company-logos/google.png');
  assert.match(logo.headers.get('cache-control'), /max-age=86400/);
});
test('production CORS allows configured origins but not development previews', async () => {
  const allowed = await fetch(base + '/api/health', { headers: { Origin: 'https://example.com' } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://example.com');
  const denied = await fetch(base + '/api/health', { headers: { Origin: 'http://localhost:5174' } });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
});
test('unknown APIs return JSON 404 instead of the SPA', async () => {
  const response = await fetch(base + '/api/not-a-route');
  assert.equal(response.status, 404); assert.equal((await response.json()).success, false);
});
test('health endpoint reports database not ready', async () => {
  assert.equal((await fetch(base + '/api/health')).status, 503);
});
test('public reset endpoint rejects missing OTP', async () => {
  const response = await fetch(base + '/api/auth/reset-password/verify', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({email:'person@example.com'}) });
  assert.equal(response.status, 400); assert.match((await response.json()).message, /six-digit/);
});
test('protected API rejects reset token', async () => {
  const token = jwt.sign({id:'507f1f77bcf86cd799439011',purpose:'password_reset'},process.env.JWT_SECRET);
  const response = await fetch(base + '/api/progress', {headers:{authorization:`Bearer ${token}`}});
  assert.equal(response.status, 401);
});
