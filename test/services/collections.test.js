const assert = require('assert');
const app = require('../../src/app');

describe('\'collections\' service', () => {
  it('registered the service', () => {
    const service = app.service('collections');

    assert.ok(service, 'Registered the service');
  });
});
