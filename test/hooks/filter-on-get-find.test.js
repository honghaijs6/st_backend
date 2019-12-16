const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const filterOnGetFind = require('../../src/hooks/filter-on-get-find');

describe('\'filter-on-get-find\' hook', () => {
  let app;

  beforeEach(() => {
    app = feathers();

    app.use('/dummy', {
      async get(id) {
        return { id };
      }
    });

    app.service('dummy').hooks({
      before: filterOnGetFind()
    });
  });

  it('runs the hook', async () => {
    const result = await app.service('dummy').get('test');
    
    assert.deepEqual(result, { id: 'test' });
  });
});
