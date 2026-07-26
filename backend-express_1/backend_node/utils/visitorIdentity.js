// Equivalent of app/services/visitor_identity.py
const crypto = require('crypto');

/** Daily-rotating, privacy-preserving visitor hash used only for human clicks. */
function dailyVisitorHash(ipAddress, userAgent, secret) {
  if (!ipAddress) return null;
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC
  const normalizedUa = (userAgent || '').toLowerCase().trim().split(/\s+/).join(' ');
  return crypto.createHmac('sha256', secret).update(`${date}:${ipAddress}:${normalizedUa}`).digest('hex');
}

module.exports = { dailyVisitorHash };
