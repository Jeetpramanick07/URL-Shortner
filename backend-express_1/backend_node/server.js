// Equivalent of uvicorn app.main:app + the FastAPI `lifespan` startup check.
const app = require('./app');
const settings = require('./config');
const { checkConnection } = require('./database');

async function start() {
  try {
    await checkConnection();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      'Database connection failed during startup. Check DATABASE_URL and PostgreSQL.',
      err
    );
    process.exit(1);
  }

  const server = app.listen(settings.port, () => {
    // eslint-disable-next-line no-console
    console.log(`${settings.appName} listening on port ${settings.port} (${settings.appEnv})`);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
