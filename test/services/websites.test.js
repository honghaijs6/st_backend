const assert = require('assert');
const app = require('../../src/app');

describe('\'websites\' service', () => {
  it('registered the service', () => {
    const service = app.service('websites');

    assert.ok(service, 'Registered the service');
  });
});
