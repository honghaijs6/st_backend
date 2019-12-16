// Initializes the `users` service on path `/users`
/* THIS USER SERVICE OBJECT : WORKINHG WITH DATABASE  */

/*
RELATIONSHIP WITH
  - WH_LOG

*/

const myService = require('./class');
const hooks = require('./hooks');
const events = require('./events');


const MODE = 'products';


module.exports = function (app) {

  /* ROUTE : /users */
  app.use('/'+MODE,myService({app})) ;
  app.use('/'+MODE+'/:method',myService({app})) ;
  const service = app.service(MODE);
  service.hooks(hooks);

  service.publish((data, context) => {

    if(data.name==='success'){
      const  idata = data.data ;

      return [
        app.channel(`id-${idata.creator_id}`),
        app.channel('admins'),
      ]
    }
  });

};
