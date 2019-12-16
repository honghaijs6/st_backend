
const nodemailer = require("nodemailer");


const sendMail = (mailConfig=null,json = null)=>{

   let ret = {
     name:'error-sendMail',
     message:'',
     data:{}
   };

   // USING DEFAUL ACCOUT MAILER
   mailConfig = mailConfig || {
     service:'gmail',
     auth:{
            user: 'honghai.dev@gmail.com',
            pass: 'admin@333'
      }
   }

   return new Promise((resolve,reject)=>{
     try{

       const transporter = nodemailer.createTransport(mailConfig);

       const mailOptions = {
         from: '"VI KHANG  🔔" <honghai.dev@gmail.com>',
         to: json.to, // list of receivers
         subject: json.subject, // Subject line
         html: json.content// plain text body
       };

       transporter.sendMail(mailOptions, function (err, info) {
          if(err)
            resolve(
              Object.assign(ret,{
                message:err
              })
            )
          else
            resolve(
              Object.assign(ret,{
                name:'success',
                data:info
              })
            )
       });


     }catch(err){
        console.log(err);
        Object.assign(ret,{
          error:err
        })

     }
   });

}

module.exports = sendMail;
