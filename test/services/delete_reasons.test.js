const assert = require('assert');
const app = require('../../src/app');

describe('\'delete_reasons\' service', () => {
  it('registered the service', () => {
    const service = app.service('delete_reasons');

    assert.ok(service, 'Registered the service');
  });
});
