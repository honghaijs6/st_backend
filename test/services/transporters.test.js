const assert = require('assert');
const app = require('../../src/app');

describe('\'transporters\' service', () => {
  it('registered the service', () => {
    const service = app.service('transporters');

    assert.ok(service, 'Registered the service');
  });
});
