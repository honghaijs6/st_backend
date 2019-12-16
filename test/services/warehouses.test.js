const assert = require('assert');
const app = require('../../src/app');

describe('\'warehouses\' service', () => {
  it('registered the service', () => {
    const service = app.service('warehouses');

    assert.ok(service, 'Registered the service');
  });
});
