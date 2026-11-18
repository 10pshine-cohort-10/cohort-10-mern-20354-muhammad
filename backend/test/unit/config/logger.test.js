'use strict';

const { expect } = require('chai');
const { Writable } = require('node:stream');

const { createLogger } = require('../../../src/config/logger');

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
