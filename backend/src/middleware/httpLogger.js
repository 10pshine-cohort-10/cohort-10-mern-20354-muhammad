'use strict';

const { randomUUID } = require('node:crypto');
const pinoHttp = require('pino-http');
const { logger } = require('../config/logger');

const REQUEST_ID_HEADER = 'x-request-id';

function isValidRequestId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 128;
}

// Strip the query string so raw query values (tokens, emails, search terms)
// never reach the logs — only the path is safe to record.
function pathOnly(url) {
  if (typeof url !== 'string') return url;
  const queryIndex = url.indexOf('?');
  return queryIndex === -1 ? url : url.slice(0, queryIndex);
}

// pino-http runs this on top of the default serializer output. Keep the
// request id, method, path and connection info; drop `query`/`params` and
// never echo the raw query string.
function reqSerializer(req) {
  return {
    id: req.id,
    method: req.method,
    url: pathOnly(req.url),
    headers: req.headers,
    remoteAddress: req.remoteAddress,
    remotePort: req.remotePort,
  };
}

const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const id = isValidRequestId(incoming) ? incoming : randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  serializers: {
    req: reqSerializer,
  },
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  autoLogging: {
    ignore: (req) => pathOnly(req.url) === '/api/v1/health',
  },
});

module.exports = {
  httpLogger,
  REQUEST_ID_HEADER,
  isValidRequestId,
  pathOnly,
  reqSerializer,
};
