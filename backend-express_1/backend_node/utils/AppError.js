// A lightweight HTTP error carrier, equivalent to FastAPI's HTTPException.
// The centralized error handler (middleware/errorHandler.js) turns this
// into the same `{ "detail": "<message>" }` JSON body the old backend sent,
// which is exactly what the frontend's apiClient.js already expects.
class AppError extends Error {
  constructor(statusCode, detail, headers) {
    super(typeof detail === 'string' ? detail : JSON.stringify(detail));
    this.statusCode = statusCode;
    this.detail = detail;
    this.headers = headers || null;
  }
}

module.exports = AppError;
