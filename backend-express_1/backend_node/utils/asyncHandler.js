// Express 4 does not automatically forward rejected promises to next().
// Wrapping every async controller keeps them behaving like FastAPI's
// async def endpoints, where a raised exception always reaches the
// exception handler.
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
