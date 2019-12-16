const assert = require('assert');
const app = require('../../src/app');

describe('\'user_roles\' service', () => {
  it('registered the service', () => {
    const service = app.service('user_roles');

    assert.ok(service, 'Registered the service');
  });
});
