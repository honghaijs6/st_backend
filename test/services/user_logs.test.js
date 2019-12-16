const assert = require('assert');
const app = require('../../src/app');

describe('\'user_logs\' service', () => {
  it('registered the service', () => {
    const service = app.service('user-logs');

    assert.ok(service, 'Registered the service');
  });
});
