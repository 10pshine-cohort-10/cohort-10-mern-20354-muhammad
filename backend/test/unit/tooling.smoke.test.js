'use strict';

const { expect } = require('chai');

describe('tooling smoke test: mocha and chai are wired correctly', () => {
  it('runs an assertion through Chai', () => {
    expect(1 + 1).to.equal(2);
  });

  it('exposes the Chai expect API', () => {
    expect('notes').to.be.a('string');
    expect([1, 2, 3]).to.have.length(3);
  });
});
