// Equivalent of app/utils/ip_hash.py
const crypto = require('crypto');

/** Return a daily rotating HMAC-SHA256 digest instead of storing a raw IP. */
function hashIp(ipAddress, secret) {
  if (!ipAddress) return null;
  const utcDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC
  const message = `${utcDate}:${ipAddress}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

module.exports = { hashIp };
