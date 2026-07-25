// Equivalent of app/utils/host.py
const net = require('net');
const settings = require('../config');

const HOST_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function isIpAddress(value) {
  return net.isIP(value) !== 0;
}

function validateHostname(hostname) {
  if (hostname === 'localhost') return;
  if (isIpAddress(hostname)) return;

  if (hostname.length > 253) {
    throw new Error('Hostname is too long.');
  }

  const labels = hostname.replace(/\.+$/, '').split('.');
  if (labels.length < 2 || labels.some((label) => !HOST_LABEL_RE.test(label))) {
    throw new Error('Invalid hostname.');
  }
}

/** Normalize an admin-supplied or request hostname and remove its port. */
function normalizeHostname(value) {
  const raw = (value || '').trim();
  if (!raw) throw new Error('Hostname is required.');

  const hasScheme = raw.includes('://');
  let urlToParse = hasScheme ? raw : `http://${raw}`;

  let parsed;
  try {
    parsed = new URL(urlToParse);
  } catch {
    throw new Error('Invalid hostname.');
  }

  if (hasScheme && !['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https hostnames are supported.');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Hostname must not include credentials.');
  }

  if (parsed.search || parsed.hash) {
    throw new Error('Hostname must not include a query string or fragment.');
  }

  if (!['', '/'].includes(parsed.pathname)) {
    throw new Error('Hostname must not include a path.');
  }

  const hostname = parsed.hostname;
  if (!hostname) throw new Error('Invalid hostname.');

  const normalized = hostname.toLowerCase().replace(/\.+$/, '');
  validateHostname(normalized);
  return normalized;
}

/** Resolve a request host, optionally honoring proxy headers when enabled. */
function getRequestHostname(req) {
  let hostValue = null;

  if (settings.trustProxyHeaders) {
    const forwarded = req.headers['x-forwarded-host'];
    if (forwarded) {
      hostValue = forwarded.split(',')[0].trim();
    }
  }

  if (!hostValue) {
    hostValue = req.headers.host || null;
  }

  if (!hostValue) {
    throw new Error('Request hostname is missing.');
  }

  return normalizeHostname(hostValue);
}

module.exports = { normalizeHostname, getRequestHostname };
