// Equivalent of the HTTP-facing part of app/routers/redirect.py
const { resolveShortLink } = require('../services/redirectService');

async function resolveSlug(req, res) {
  const destination = await resolveShortLink(req);
  res.set('Cache-Control', 'no-store, private, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('X-Robots-Tag', 'noindex, nofollow');
  res.redirect(302, destination);
}

module.exports = { resolveSlug };
