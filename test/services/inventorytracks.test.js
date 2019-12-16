const assert = require('assert');
const app = require('../../src/app');

describe('\'inventorytracks\' service', () => {
  it('registered the service', () => {
    const service = app.service('inventorytracks');

    assert.ok(service, 'Registered the service');
  });
});
