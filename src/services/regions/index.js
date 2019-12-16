
/*
  RELATIONSHIP WITH

   NO ONE


*/

const myService = require('./class');
const hooks = require('./hooks');
const events = require('./events');

const mode = 'regions';


module.exports = function(app){
  /* ROUTE : /users */
  app.use('/'+mode,myService({app})) ;
  app.use('/'+mode+'/:method',myService({app})) ;

  const service = app.service(mode);
  service.hooks(hooks);
}
