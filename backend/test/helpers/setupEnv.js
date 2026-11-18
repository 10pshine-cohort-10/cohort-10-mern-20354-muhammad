'use strict';

// Loaded by Mocha before any test file (see .mocharc.cjs) so the app's
// strict env validation always sees test values, with or without a .env file.
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.LOG_LEVEL = 'silent';
