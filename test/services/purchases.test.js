const assert = require('assert');
const app = require('../../src/app');

describe('\'purchases\' service', () => {
  it('registered the service', () => {
    const service = app.service('purchases');

    assert.ok(service, 'Registered the service');
  });
});
