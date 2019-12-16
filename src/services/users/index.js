// Initializes the `users` service on path `/users`

/* THIS USER SERVICE OBJECT : WORKINHG WITH DATABASE  */
const myService = require('./class');
const hooks = require('./hooks');


const mode = 'users';

module.exports = function (app) {

  /* ROUTE : /users => database service action for response : test from ATOM */

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


};
