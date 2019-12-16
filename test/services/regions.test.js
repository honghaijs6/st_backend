const assert = require('assert');
const app = require('../../src/app');

describe('\'regions\' service', () => {
  it('registered the service', () => {
    const service = app.service('regions');

    assert.ok(service, 'Registered the service');
  });
});
