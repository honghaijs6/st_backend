const assert = require('assert');
const app = require('../../src/app');

describe('\'levels\' service', () => {
  it('registered the service', () => {
    const service = app.service('levels');

    assert.ok(service, 'Registered the service');
  });
});
