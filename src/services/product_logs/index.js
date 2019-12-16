
/*
  RELATIONSHIP WITH

   NO ONE


*/

const myService = require('./class');
const hooks = require('./hooks');
const events = require('./events');

const MODE = 'product_logs';

module.exports = function(app){
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
  
}
