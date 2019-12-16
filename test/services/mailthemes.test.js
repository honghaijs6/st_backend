const assert = require('assert');
const app = require('../../src/app');

describe('\'mailthemes\' service', () => {
  it('registered the service', () => {
    const service = app.service('mailthemes');

    assert.ok(service, 'Registered the service');
  });
});
