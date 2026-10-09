exports.escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
exports.pageSize = value => Math.min(100, Math.max(1, parseInt(value, 10) || 10));
exports.pageNumber = value => Math.min(100000, Math.max(1, parseInt(value, 10) || 1));
