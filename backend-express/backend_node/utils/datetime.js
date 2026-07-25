// Equivalent of app/utils/datetime.py

/** Return the current UTC Date (JS Dates are always internally UTC-based). */
function utcNow() {
  return new Date();
}

module.exports = { utcNow };
