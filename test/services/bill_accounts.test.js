const assert = require('assert');
const app = require('../../src/app');

describe('\'bill_accounts\' service', () => {
  it('registered the service', () => {
    const service = app.service('bill-accounts');

    assert.ok(service, 'Registered the service');
  });
});
