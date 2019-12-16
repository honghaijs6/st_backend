const assert = require('assert');
const app = require('../../src/app');

describe('\'Subregions\' service', () => {
  it('registered the service', () => {
    const service = app.service('subregions');

    assert.ok(service, 'Registered the service');
  });
});
