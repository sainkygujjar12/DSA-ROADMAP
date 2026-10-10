const { catalogCache } = require('../utils/catalogCache');

module.exports = function invalidateCatalogAfterWrite(req, res, next) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) &&
      /^\/(admin|questions|topics|companies|sheets)(\/|$)/.test(req.path)) {
    res.once('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) catalogCache.clear();
    });
  }
  next();
};
