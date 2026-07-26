// Equivalent of app/schemas/domain.py (DomainCreate validation).
const AppError = require('../utils/AppError');
const { normalizeHostname } = require('../utils/host');

function validateDomainCreate(body) {
  const errors = [];
  let hostname;
  let displayName;

  try {
    if (typeof body.hostname !== 'string') throw new Error('Hostname must be a string.');
    hostname = normalizeHostname(body.hostname);
  } catch (err) {
    errors.push(err.message);
  }

  if (typeof body.display_name !== 'string') {
    errors.push('Display name must be a string.');
  } else {
    displayName = body.display_name.trim();
    if (!displayName) errors.push('Display name cannot be empty.');
  }

  if (errors.length) {
    throw new AppError(422, errors[0]);
  }

  return { hostname, display_name: displayName };
}

module.exports = { validateDomainCreate };
