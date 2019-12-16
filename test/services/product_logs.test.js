const assert = require('assert');
const app = require('../../src/app');

describe('\'product_logs\' service', () => {
  it('registered the service', () => {
    const service = app.service('product-logs');

    assert.ok(service, 'Registered the service');
  });
});
