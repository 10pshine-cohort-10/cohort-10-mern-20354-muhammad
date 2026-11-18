'use strict';

const app = require('./app');
const env = require('./config/env');
const { logger } = require('./config/logger');

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'app.started');
});

function shutdown(signal) {
  logger.info({ signal }, 'app.shutdown');

  const forceExit = setTimeout(() => {
    logger.error('app.shutdown_forced');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  server.close(() => {
    clearTimeout(forceExit);
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
