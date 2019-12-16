const assert = require('assert');
const app = require('../../src/app');

describe('\'webthemes\' service', () => {
  it('registered the service', () => {
    const service = app.service('webthemes');

    assert.ok(service, 'Registered the service');
  });
});
