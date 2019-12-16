
const sendMail = require('../hooks/ultil/sendMail');
const mailer = (app)=>{



    // MAILER SEND GATEWAY
    app.post('/mailer', async (req,res)=>{

      const ret = {
        name:'hook-err',
        message:'',
        data:{}
      };
      const resSendMail = await  sendMail(null,req.body);
      res.json(Object.assign(ret,resSendMail));

    });

}

module.exports = mailer;
