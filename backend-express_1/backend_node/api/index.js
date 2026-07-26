// Vercel's @vercel/node runtime calls this exported Express app directly
// as a serverless function per request — it does not call app.listen().
// server.js (with its app.listen + DB-connectivity check) is still used for
// local development and any non-serverless hosting (Docker, Railway, a VM, etc.).
module.exports = require('../app');
