const assert = require('assert');
const app = require('../../src/app');

describe('\'brandnames\' service', () => {
  it('registered the service', () => {
    const service = app.service('brandnames');

    assert.ok(service, 'Registered the service');
  });
});
