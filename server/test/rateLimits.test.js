const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { edgeLimiter, userLimiter, authLimiter } = require('../src/middleware/rateLimits');
let server, base;
test.before(async () => {
  const app = express();
  app.use(express.json(), edgeLimiter);
  // Test fixture represents the already authenticated identity; production
  // derives this only from a verified JWT and current database account.
  app.use((req, res, next) => { if (req.headers['test-user']) req.user = { id: req.headers['test-user'] }; next(); });
  app.use(userLimiter);
  app.post('/login', authLimiter, (req, res) => res.sendStatus(204));
  app.get('/questions', (req, res) => res.sendStatus(204));
  await new Promise((resolve, reject) => { server = app.listen(0, '127.0.0.1', resolve); server.on('error', reject); });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => { if (server) await new Promise(resolve => server.close(resolve)); });
test('200 distinct accounts can attempt login on one shared IP', async () => {
  for (let i = 0; i < 200; i++) {
    const response = await fetch(base + '/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `user${i}@example.com` }) });
    assert.equal(response.status, 204);
  }
});
test('auth budget follows normalized email without blocking a different account', async () => {
  for (let i = 0; i < 20; i++) {
    assert.equal((await fetch(base + '/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: ' RateTest@Example.com ' }) })).status, 204);
  }
  const blocked = await fetch(base + '/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'ratetest@example.com' }) });
  assert.equal(blocked.status, 429);
  assert.ok(blocked.headers.get('retry-after'));
  assert.equal((await fetch(base + '/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'unrelated@example.com' }) })).status, 204);
});
test('signed-in API budgets are independent on the same IP', async () => {
  for (let i = 0; i < 300; i++) assert.equal((await fetch(base + '/questions', { headers: { 'test-user': 'a' } })).status, 204);
  assert.equal((await fetch(base + '/questions', { headers: { 'test-user': 'a' } })).status, 429);
  assert.equal((await fetch(base + '/questions', { headers: { 'test-user': 'b' } })).status, 204);
});
