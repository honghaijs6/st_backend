const assert = require('assert');
const app = require('../../src/app');

describe('\'customer_status\' service', () => {
  it('registered the service', () => {
    const service = app.service('customer_status');

    assert.ok(service, 'Registered the service');
  });
});
