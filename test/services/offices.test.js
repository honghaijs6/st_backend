const assert = require('assert');
const app = require('../../src/app');

describe('\'offices\' service', () => {
  it('registered the service', () => {
    const service = app.service('offices');

    assert.ok(service, 'Registered the service');
  });
});
