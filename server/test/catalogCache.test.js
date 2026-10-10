const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { catalogCache, createCatalogCache } = require('../src/utils/catalogCache');
const invalidate = require('../src/middleware/catalogCache');

test('catalog reads coalesce and expire without caching failures', async () => {
  let time = 0, loads = 0;
  const cache = createCatalogCache({ ttlMs: 30, now: () => time });
  const load = async () => ++loads;
  assert.deepEqual(await Promise.all(Array.from({ length: 20 }, () => cache.get('stats', load))), Array(20).fill(1));
  time = 29;
  assert.equal(await cache.get('stats', load), 1);
  time = 30;
  assert.equal(await cache.get('stats', load), 2);
  await assert.rejects(cache.get('failed', async () => { throw new Error('offline'); }), /offline/);
  assert.equal(await cache.get('failed', load), 3);
});

test('writes invalidate cached and in-flight data only after success', async () => {
  catalogCache.clear();
  let resolve;
  const stale = catalogCache.get('topics', () => new Promise(done => { resolve = done; }));
  await Promise.resolve();
  const failed = new EventEmitter(); failed.statusCode = 403;
  invalidate({ method: 'PUT', path: '/topics/example' }, failed, () => {});
  failed.emit('finish');
  const successful = new EventEmitter(); successful.statusCode = 200;
  invalidate({ method: 'POST', path: '/admin/questions/bulk' }, successful, () => {});
  successful.emit('finish');
  assert.equal(await catalogCache.get('topics', async () => 'new'), 'new');
  resolve('old'); await stale;
  assert.equal(await catalogCache.get('topics', async () => 'unexpected'), 'new');
  catalogCache.clear();
});
