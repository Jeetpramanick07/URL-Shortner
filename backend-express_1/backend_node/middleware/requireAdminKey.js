// Equivalent of app/dependencies.py::require_admin_key.
// Protects management endpoints with a constant-time API-key comparison,
// exactly like the original FastAPI dependency.
const crypto = require('crypto');
const settings = require('../config');
const AppError = require('../utils/AppError');

function timingSafeEqual(a, b) {
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  if (bufferA.length !== bufferB.length) return false;
  return crypto.timingSafeEqual(bufferA, bufferB);
}

function requireAdminKey(req, res, next) {
  const provided = req.header('X-Admin-Key');
  const expected = settings.adminApiKey;

  if (!provided || !timingSafeEqual(provided, expected)) {
    return next(
      new AppError(401, 'Invalid or missing admin API key.', { 'WWW-Authenticate': 'ApiKey' })
    );
  }
  return next();
}

module.exports = requireAdminKey;
