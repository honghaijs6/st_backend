const assert = require('assert');
const app = require('../../src/app');

describe('\'cointracks\' service', () => {
  it('registered the service', () => {
    const service = app.service('cointracks');

    assert.ok(service, 'Registered the service');
  });
});
