'use strict';

const { randomUUID } = require('node:crypto');
const pinoHttp = require('pino-http');
const { logger } = require('../config/logger');

const REQUEST_ID_HEADER = 'x-request-id';

function isValidRequestId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 128;
}

const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const id = isValidRequestId(incoming) ? incoming : randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  autoLogging: {
    ignore: (req) => req.url === '/api/v1/health',
  },
});

module.exports = { httpLogger, REQUEST_ID_HEADER };
