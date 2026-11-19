'use strict';

const { expect } = require('chai');
const request = require('supertest');

const app = require('../../src/app');

describe('integration: body parser errors', () => {
  it('malformed JSON returns 400 with the standard envelope and requestId', async () => {
    const res = await request(app)
      .post('/api/v1/health')
      .set('Content-Type', 'application/json')
      .send('{"title": ')
      .expect(400);

    expect(res.body.success).to.equal(false);
    expect(res.body.error.code).to.equal('VALIDATION_ERROR');
    expect(res.body.error.message).to.equal('Malformed JSON in request body');
    expect(res.body.error.requestId).to.be.a('string').and.not.equal('');
    expect(res.headers['x-request-id']).to.equal(res.body.error.requestId);
  });

  it('oversized payload returns 413 PAYLOAD_TOO_LARGE with the envelope', async () => {
    const oversized = JSON.stringify({ blob: 'x'.repeat(300 * 1024) });

    const res = await request(app)
      .post('/api/v1/health')
      .set('Content-Type', 'application/json')
      .send(oversized)
      .expect(413);

    expect(res.body.success).to.equal(false);
    expect(res.body.error.code).to.equal('PAYLOAD_TOO_LARGE');
    expect(res.body.error.message).to.equal('Request payload too large');
    expect(res.body.error.requestId).to.be.a('string').and.not.equal('');
    expect(res.headers['x-request-id']).to.equal(res.body.error.requestId);
  });
});
