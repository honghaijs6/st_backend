const assert = require('assert');
const app = require('../../src/app');

describe('\'landingpages\' service', () => {
  it('registered the service', () => {
    const service = app.service('landingpages');

    assert.ok(service, 'Registered the service');
  });
});
