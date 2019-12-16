const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const dataInCreated = require('../../src/hooks/data-in-created');

describe('\'data-in-created\' hook', () => {
  let app;

  beforeEach(() => {
    app = feathers();

    app.use('/dummy', {
      async get(id) {
        return { id };
      }
    });

    app.service('dummy').hooks({
      before: dataInCreated()
    });
  });

  it('runs the hook', async () => {
    const result = await app.service('dummy').get('test');
    
    assert.deepEqual(result, { id: 'test' });
  });
});
