


const bodyParser = require('body-parser');
const DeviceMeetServer = require('./DeviceMeetServer') ;


const iclock = (app)=>{



  /* METHOD POST */
  app.post('/iclock/:param',  bodyParser.raw({ type : '*/*' }), async (req,res)=>{


    DeviceMeetServer.doPost(req,res) ;

  })




  /*  METHOD : GET */
  app.get('/iclock/:param', async (req,res)=>{

    DeviceMeetServer.doPost(req,res) ;



  })

  //pushapi._pool(app) ;



}

module.exports = iclock ;
