// FastAPI automatically returns 422 when a path parameter typed as `UUID`
// doesn't parse. Express does no such thing, so this middleware fills the gap.
const AppError = require('../utils/AppError');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateUuidParam(paramName) {
  return function middleware(req, res, next) {
    const value = req.params[paramName];
    if (!UUID_RE.test(value)) {
      return next(new AppError(422, `${paramName} must be a valid UUID.`));
    }
    return next();
  };
}

module.exports = validateUuidParam;
