'use strict';

const { expect } = require('chai');
const { Writable } = require('node:stream');

const { createLogger } = require('../../../src/config/logger');
const { reqSerializer, pathOnly } = require('../../../src/middleware/httpLogger');

function createCaptureStream() {
  const capture = { data: '' };
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      capture.data += chunk.toString();
      callback();
    },
  });
  return { stream, capture };
}

describe('unit: logger redaction', () => {
  it('redacts every sensitive field and keeps normal fields readable', () => {
    const { stream, capture } = createCaptureStream();
    const logger = createLogger({ level: 'info', destination: stream });

    logger.info(
      {
        password: 'SuperSecret1',
        passwordHash: 'bcrypt$abc',
        token: 'jwt-token-value',
        accessToken: 'access-value',
        refreshToken: 'refresh-value',
        authorization: 'Bearer secret-header',
        cookie: 'sid=secret-cookie',
        userId: 'user-123',
      },
      'auth.test',
    );

    const line = JSON.parse(capture.data);
    for (const key of [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'cookie',
    ]) {
      expect(line[key], `${key} should be redacted`).to.equal('[Redacted]');
    }

    expect(line.userId).to.equal('user-123');
    expect(line.msg).to.equal('auth.test');

    for (const secret of [
      'SuperSecret1',
      'bcrypt$abc',
      'jwt-token-value',
      'access-value',
      'refresh-value',
      'Bearer secret-header',
      'sid=secret-cookie',
    ]) {
      expect(capture.data, `"${secret}" must not appear in logs`).to.not.include(secret);
    }
  });
});

describe('unit: http logger request serializer', () => {
  it('logs the path only and never the raw query string', () => {
    const serialized = reqSerializer({
      id: 'req-1',
      method: 'GET',
      url: '/api/v1/notes?token=supersecret&q=private-search',
      headers: { 'user-agent': 'mocha' },
      remoteAddress: '127.0.0.1',
      remotePort: 4000,
    });

    expect(serialized.url).to.equal('/api/v1/notes');
    expect(serialized.id).to.equal('req-1');
    expect(serialized.method).to.equal('GET');
    expect(serialized.headers).to.deep.equal({ 'user-agent': 'mocha' });
    expect(serialized).to.not.have.property('query');

    const line = JSON.stringify(serialized);
    expect(line).to.not.include('supersecret');
    expect(line).to.not.include('private-search');
    expect(line).to.not.include('?');
  });

  it('keeps urls without a query string untouched', () => {
    expect(pathOnly('/api/v1/health')).to.equal('/api/v1/health');
    expect(pathOnly('/api/v1/notes?page=2')).to.equal('/api/v1/notes');
    expect(pathOnly(undefined)).to.equal(undefined);
  });
});
