
/*
relationship with :
  orders
  wh      : phieu kho
*/

const myService = require('./class');
const hooks = require('./hooks');

const mode = 'customer_status';

module.exports = function(app){
  /* ROUTE : /users */
  app.use('/'+mode,myService({app})) ;
  app.use('/'+mode+'/:method',myService({app})) ;

  const service = app.service(mode);
  service.hooks(hooks);

  /*
  public realtime to channel CA NHAN - channel : admins
  */
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
