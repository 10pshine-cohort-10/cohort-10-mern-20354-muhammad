'use strict';

const { expect } = require('chai');
const {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
} = require('../../../src/errors/AppError');

describe('unit: AppError hierarchy', () => {
  it('AppError defaults to 500 INTERNAL_ERROR and is operational', () => {
    const err = new AppError('boom');
    expect(err).to.be.an.instanceOf(Error);
    expect(err).to.be.an.instanceOf(AppError);
    expect(err.statusCode).to.equal(500);
    expect(err.code).to.equal('INTERNAL_ERROR');
    expect(err.isOperational).to.equal(true);
    expect(err.message).to.equal('boom');
  });

  it('ValidationError returns 400 VALIDATION_ERROR with details', () => {
    const details = [{ field: 'email', message: 'Invalid email address' }];
    const err = new ValidationError('Invalid input', details);
    expect(err).to.be.an.instanceOf(AppError);
    expect(err.statusCode).to.equal(400);
    expect(err.code).to.equal('VALIDATION_ERROR');
    expect(err.details).to.deep.equal(details);
  });

  it('AuthenticationError returns 401 UNAUTHENTICATED', () => {
    const err = new AuthenticationError();
    expect(err.statusCode).to.equal(401);
    expect(err.code).to.equal('UNAUTHENTICATED');
    expect(err.message).to.equal('Authentication required');
  });

  it('NotFoundError returns 404 NOT_FOUND', () => {
    const err = new NotFoundError('Note not found');
    expect(err.statusCode).to.equal(404);
    expect(err.code).to.equal('NOT_FOUND');
    expect(err.message).to.equal('Note not found');
  });

  it('ConflictError returns 409 and accepts a custom code', () => {
    const generic = new ConflictError();
    expect(generic.statusCode).to.equal(409);
    expect(generic.code).to.equal('CONFLICT');

    const specific = new ConflictError('Email taken', { code: 'EMAIL_ALREADY_REGISTERED' });
    expect(specific.statusCode).to.equal(409);
    expect(specific.code).to.equal('EMAIL_ALREADY_REGISTERED');
  });

  it('keeps a usable stack trace', () => {
    const err = new ValidationError();
    expect(err.stack).to.be.a('string').and.include('AppError');
  });
});
