const assert = require('assert');
const app = require('../../src/app');

describe('\'units\' service', () => {
  it('registered the service', () => {
    const service = app.service('units');

    assert.ok(service, 'Registered the service');
  });
});
