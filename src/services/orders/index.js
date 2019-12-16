
/*
  RELATIONSHIP WITH

    Order_log
    Customer
    Wh_log
    Product


*/

const myService = require('./class');
const hooks = require('./hooks');
const events = require('./events');

const mode = 'orders';


module.exports = function(app){
  /* ROUTE : /users */
  app.use('/'+mode,myService({app})) ;
  app.use('/'+mode+'/:method',myService({app})) ;

  const service = app.service(mode);
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
