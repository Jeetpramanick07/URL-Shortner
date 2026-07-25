// Equivalent of app/routers/health.py
const settings = require('../config');

function health(req, res) {
  res.json({
    status: 'ok',
    app: settings.appName,
    environment: settings.appEnv,
  });
}

module.exports = { health };
