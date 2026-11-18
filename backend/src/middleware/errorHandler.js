'use strict';

const { AppError } = require('../errors/AppError');
const { logger } = require('../config/logger');

function toErrorResponse(err, req) {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      body: {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
          requestId: req.id || null,
        },
      },
    };
  }

  return {
    statusCode: 500,
    body: {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        requestId: req.id || null,
      },
    },
  };
}

function errorHandler(err, req, res, _next) {
  const { statusCode, body } = toErrorResponse(err, req);
  const logPayload = { requestId: req.id, statusCode };

  if (statusCode >= 500) {
    logger.error({ ...logPayload, err }, 'request.failed');
  } else {
    logger.warn(
      { ...logPayload, err: { message: err.message, code: body.error.code } },
      'request.rejected',
    );
  }

  if (res.headersSent) {
    return;
  }

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
