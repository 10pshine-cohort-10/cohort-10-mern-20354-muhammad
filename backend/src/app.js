'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const { httpLogger } = require('./middleware/httpLogger');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors(env.CLIENT_ORIGIN ? { origin: env.CLIENT_ORIGIN, credentials: true } : {}));
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());
app.use(httpLogger);
app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
