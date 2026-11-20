'use strict';

const pino = require('pino');
const env = require('./env');

const REDACT_PATHS = [
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
];

function createLogger({ level = env.LOG_LEVEL, destination } = {}) {
  const options = {
    level,
    base: { service: 'notes-backend', pid: process.pid },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: REDACT_PATHS, censor: '[Redacted]' },
  };

  if (!destination && env.NODE_ENV === 'development') {
    options.transport = {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
    };
  }

  return destination ? pino(options, destination) : pino(options);
}

const logger = createLogger();

module.exports = { logger, createLogger };
