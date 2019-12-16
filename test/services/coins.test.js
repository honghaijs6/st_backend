const assert = require('assert');
const app = require('../../src/app');

describe('\'coins\' service', () => {
  it('registered the service', () => {
    const service = app.service('coins');

    assert.ok(service, 'Registered the service');
  });
});
