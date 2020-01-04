const users = require('./users');
const coupons = require('./coupons')

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);

  app.configure(coupons)
};
