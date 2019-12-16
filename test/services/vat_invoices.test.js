const assert = require('assert');
const app = require('../../src/app');

describe('\'vat_invoices\' service', () => {
  it('registered the service', () => {
    const service = app.service('vat-invoices');

    assert.ok(service, 'Registered the service');
  });
});
