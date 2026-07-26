// Centralized error handler. Every error response — validation failure,
// not-found, conflict, auth failure, or unexpected crash — is normalized to
// `{ "detail": "<message>" }`, exactly the shape the frontend's
// apiClient.js already parses (`body.detail` as a string).
const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    if (err.headers) {
      Object.entries(err.headers).forEach(([key, value]) => res.set(key, value));
    }
    return res.status(err.statusCode).json({ detail: err.detail });
  }

  // Sequelize unique-constraint violations that slipped past app-level checks.
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ detail: 'A record with this value already exists.' });
  }

  if (err.name === 'SequelizeValidationError') {
    const message = err.errors?.[0]?.message || 'Validation failed.';
    return res.status(422).json({ detail: message });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ detail: 'Internal server error.' });
}

function notFoundHandler(req, res) {
  res.status(404).json({ detail: 'Not found.' });
}

module.exports = { errorHandler, notFoundHandler };
