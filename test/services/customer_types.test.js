const assert = require('assert');
const app = require('../../src/app');

describe('\'customer_types\' service', () => {
  it('registered the service', () => {
    const service = app.service('customer_types');

    assert.ok(service, 'Registered the service');
  });
});
