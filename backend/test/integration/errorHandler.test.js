'use strict';

const { expect } = require('chai');
const express = require('express');
const request = require('supertest');

const app = require('../../src/app');
const { httpLogger } = require('../../src/middleware/httpLogger');
const notFound = require('../../src/middleware/notFound');
const errorHandler = require('../../src/middleware/errorHandler');

function buildAppWithFailingRoute() {
  const testApp = express();
  testApp.use(httpLogger);
  testApp.get('/api/v1/boom', (req, res, next) => {
    next(new Error('secret internal detail: password=hunter2'));
  });
  testApp.use(notFound);
  testApp.use(errorHandler);
  return testApp;
}

describe('integration: error handling', () => {
  describe('unknown route', () => {
    it('returns 404 with the standard envelope and a requestId', async () => {
      const res = await request(app).get('/api/v1/does-not-exist').expect(404);

      expect(res.body.success).to.equal(false);
      expect(res.body.error.code).to.equal('NOT_FOUND');
      expect(res.body.error.message).to.include('/api/v1/does-not-exist');
      expect(res.body.error.requestId).to.be.a('string').and.not.equal('');
      expect(res.headers['x-request-id']).to.equal(res.body.error.requestId);
    });

    it('reuses a client-supplied X-Request-Id', async () => {
      const res = await request(app)
        .get('/api/v1/does-not-exist')
        .set('X-Request-Id', 'test-req-42')
        .expect(404);

      expect(res.headers['x-request-id']).to.equal('test-req-42');
      expect(res.body.error.requestId).to.equal('test-req-42');
    });
  });

  describe('internal error in production mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('returns 500 with a generic message, no stack and no internals', async () => {
      process.env.NODE_ENV = 'production';

      const res = await request(buildAppWithFailingRoute()).get('/api/v1/boom').expect(500);

      expect(res.body.success).to.equal(false);
      expect(res.body.error.code).to.equal('INTERNAL_ERROR');
      expect(res.body.error.message).to.equal('Internal server error');
      expect(res.body.error.requestId).to.be.a('string').and.not.equal('');

      const raw = JSON.stringify(res.body);
      expect(raw).to.not.include('hunter2');
      expect(raw).to.not.include('secret internal detail');
      expect(raw).to.not.include('stack');
    });
  });
});
