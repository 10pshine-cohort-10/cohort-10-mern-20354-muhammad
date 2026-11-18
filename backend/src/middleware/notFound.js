'use strict';

const { NotFoundError } = require('../errors/AppError');

function notFound(req, _res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}

module.exports = notFound;
