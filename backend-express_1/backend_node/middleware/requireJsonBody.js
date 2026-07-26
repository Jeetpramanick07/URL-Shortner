// Uses express-validator (per project requirements) as the first-line guard
// that a JSON body object was actually sent on write requests. The detailed,
// FastAPI-message-parity validation (validators/domain.validator.js,
// validators/link.validator.js) still runs afterwards for every field.
const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const requireJsonBody = [
  body().custom((value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error('A JSON request body is required.');
    }
    return true;
  }),
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(new AppError(422, result.array()[0].msg));
    }
    return next();
  },
];

module.exports = requireJsonBody;
