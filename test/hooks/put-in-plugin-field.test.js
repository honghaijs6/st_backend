const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const putInPluginField = require('../../src/hooks/put-in-plugin-field');

describe('\'put-in-plugin-field\' hook', () => {
  let app;

  beforeEach(() => {
    app = feathers();

    app.use('/dummy', {
      async get(id) {
        return { id };
      }
    });

    app.service('dummy').hooks({
      
    });
  });

  it('runs the hook', async () => {
    const result = await app.service('dummy').get('test');
    
    assert.deepEqual(result, { id: 'test' });
  });
});
