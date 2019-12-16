const assert = require('assert');
const app = require('../../src/app');

describe('\'customer_orginals\' service', () => {
  it('registered the service', () => {
    const service = app.service('customer_orginals');

    assert.ok(service, 'Registered the service');
  });
});
