'use strict';

const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');

describe('integration: GET /api/v1/health', () => {
  it('returns 200 with the standard success envelope', async () => {
    const res = await request(app).get('/api/v1/health').expect(200);

    expect(res.body.success).to.equal(true);
    expect(res.body.data.status).to.equal('ok');
    expect(res.body.data.uptime).to.be.a('number').and.to.be.greaterThan(0);
  });

  it('sets an X-Request-Id response header', async () => {
    const res = await request(app).get('/api/v1/health').expect(200);

    expect(res.headers['x-request-id']).to.be.a('string').and.not.equal('');
  });
});
