
/*
  RELATIONSHIP WITH

   NO ONE


*/

const myService = require('./class');
const hooks = require('./hooks');

const mode = 'coupons';


module.exports = function(app){

  /* ROUTE : /users */
  app.use('/'+mode,myService({app})) ;
  app.use('/'+mode+'/:method',myService({app})) ;

  const service = app.service(mode);
  service.hooks(hooks);


   /// public realtim  event to room : authenticated
   /*service.publish((data, context) => {

    if(data.name==='success'){

      return app.channel('authenticated') ;

    }

  });*/



}
