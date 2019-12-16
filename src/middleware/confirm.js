
const base64 = require('base64-utf8');
const mModel = require('../models/users.model');


const getRandomString = (n) => {

  let c='abcdefghijklmnopqrstuvwxyz'; c+=c+1234567890;
  return '-'.repeat(n).replace(/./g,b=>c[~~(Math.random()*62)])

}

// GET LIKE REF
// CONVER STRING -> Object
// hash password;
// udate databse

const confirm = (app)=>{

  app.get('/confirm', async (req,res)=>{

    const userInfo = JSON.parse(base64.decode(req.query.ref));
    userInfo.password = getRandomString(8);

    const hash = require("@feathersjs/authentication-local/lib/utils/hash");
    userInfo.password =  await hash(userInfo.password);
    // UPDATE DATABASE
    const Model = mModel(app);
    res.send(Model.update(userInfo,{
      where:{
        id:22
      }
    }));

  });
}

module.exports = confirm;
