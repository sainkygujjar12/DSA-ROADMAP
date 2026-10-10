// Only shared catalog metadata belongs here. Never cache user progress or auth.
// Concurrent misses share one query; failures and invalidated loads are not kept.
function createCatalogCache({ ttlMs = 30000, now = Date.now } = {}) {
  const entries = new Map();
  return {
    async get(key, load) {
      const existing = entries.get(key);
      if (existing && (existing.pending || existing.expiresAt > now())) return existing.promise;
      const entry = { pending: true };
      entries.set(key, entry);
      entry.promise = Promise.resolve().then(load).then(value => {
        entry.pending = false;
        entry.expiresAt = now() + ttlMs;
        return value;
      }).catch(error => {
        if (entries.get(key) === entry) entries.delete(key);
        throw error;
      });
      return entry.promise;
    },
    clear() { entries.clear(); },
  };
}

const catalogCache = createCatalogCache();
module.exports = { catalogCache, createCatalogCache };
