'use strict';

const { NotFoundError } = require('../errors/AppError');

function notFound(req, _res, next) {
  // req.path excludes the query string, so values like ?password=...
  // never end up in error messages or logs.
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
}

module.exports = notFound;
