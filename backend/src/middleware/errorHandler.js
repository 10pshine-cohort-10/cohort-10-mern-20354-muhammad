'use strict';

const { randomUUID } = require('node:crypto');
const { AppError } = require('../errors/AppError');
const { logger } = require('../config/logger');

// Body-parser errors happen before httpLogger runs, so req.id may be missing.
// The envelope must always carry a requestId — generate one as a fallback.
function ensureRequestId(req, res) {
  if (req.id) return req.id;
  const id = randomUUID();
  req.id = id;
  if (!res.headersSent) {
    res.setHeader('X-Request-Id', id);
  }
  return id;
}

function toErrorResponse(err, requestId) {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      body: {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
          requestId,
        },
      },
    };
  }

  if (err.type === 'entity.too.large' || err.statusCode === 413) {
    return {
      statusCode: 413,
      body: {
        success: false,
        error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request payload too large', requestId },
      },
    };
  }

  if (
    err.type === 'entity.parse.failed' ||
    (err instanceof SyntaxError && err.status === 400 && 'body' in err)
  ) {
    return {
      statusCode: 400,
      body: {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON in request body', requestId },
      },
    };
  }

  return {
    statusCode: 500,
    body: {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error', requestId },
    },
  };
}

function errorHandler(err, req, res, next) {
  const requestId = ensureRequestId(req, res);
  const { statusCode, body } = toErrorResponse(err, requestId);
  const logPayload = { requestId, statusCode };

  if (statusCode >= 500) {
    logger.error({ ...logPayload, err }, 'request.failed');
  } else {
    logger.warn(
      { ...logPayload, err: { message: err.message, code: body.error.code } },
      'request.rejected',
    );
  }

  if (res.headersSent) {
    // Response already streaming — delegate so Express handles the failure.
    return next(err);
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
