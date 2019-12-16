const assert = require('assert');
const app = require('../../src/app');

describe('\'warehouse_receipts\' service', () => {
  it('registered the service', () => {
    const service = app.service('warehouse-receipts');

    assert.ok(service, 'Registered the service');
  });
});
