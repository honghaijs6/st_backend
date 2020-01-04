
const pushapi = require('./pushapi') ;


const zkpush = (app)=>{

    app.post('/pushapi',(req,res)=>{
      const ret = {
        desc:'hook-error',
        message:'missing method '
      };
      res.json(ret);
    });

    app.post('/pushapi/:method',(req,res)=>{
      pushapi.post(req,res);
    });

    //pushapi._pool(app) ;



}

module.exports = zkpush ;
