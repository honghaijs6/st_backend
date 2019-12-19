const request = require("request");
const PUSH_SERVER = 'http://115.78.5.75:8080'; //'http://10.121.113.6:8080';//'http://115.78.5.75:8080';//'http://10.121.113.6:8080';

const mCoupon = require('../models/coupons.model') ;

const pushapi  = {

  _idTime:20000,

  limitTime:2,

  isActiveSocket:false ,

  _realEvent(onSuccess){

    /*let options = { method: 'POST',
          url: PUSH_SERVER+'/realEvent',
    };

    request(options, function (error, response, body) {
      const json = JSON.parse(body);
      onSuccess(json) ;


    });*/

  },


  _deleteUserOnDevice(data){

      const url = 'createCmd?cmdType=userDefined&sn='+data.sn
      let options = { method: 'POST',
            url: PUSH_SERVER+'/'+url,
      };
      options.url += '&originalCmd=DATA DELETE user pin='+data.pin

      request(options, (error, response, body) =>{
          if (error) throw new Error(error);

          const json = JSON.parse(body);
          console.log(json) ;


      });


  },


  /*
  info : record info : {}

  */
  async _increaseUsedCount(info){


      const count = parseInt(info.used_count) + 1 ;
      const condition = {
        where:{
          id:info.id
        }
      };

      const isSuccess = await this.moCoupon.update({
        used_count:count
      },condition);


      console.log(isSuccess)



  },

  async emit(app,json){

    //await this.service.emit('test',"test") ;

    app.service('coupons').emit('logs', json);



  },

  _pool(app){

    if(!this.isActiveSocket){

      this.service = app.service('coupons') ;
      this.isActiveSocket = true ;

    }

    setTimeout(()=>{

      let options = { method: 'POST',
            url: PUSH_SERVER+'/realEvent',
      };

      request(options, (error, response, body)=> {

        try{
          const json = JSON.parse(body);

          console.log(json);
          this.emit(app,json) ;


          const list = json.data ;
          if(list.length > 0){


            const data = list[0] ;

            if(data.cardno !== "0"){


              this.moCoupon = mCoupon(app) ;
              this.moCoupon.getInfoByCode(data.cardno).then((res)=>{

                const info = res.data ;
                const count = parseInt(info.used_count) + 1 ;

                if(count > info.number_offer){

                  this._deleteUserOnDevice(data) ;

                }

                this._increaseUsedCount(info) ;


              });


            }



          }



          this._pool(app);
        }catch(err){}


      });



    },1000)
  },

  post(req,res){
    const params = req.params;
    const query = req.query;

    let ret = {
      desc:'ok',
    };

    if(pushapi.allowMethod(params.method)){

      const url = req.originalUrl.replace('/pushapi/','');
      let options = { method: 'POST',
            url: PUSH_SERVER+'/'+url,
      };

      switch (params.method) {
        case 'createCmd':
          const idata = req.body ;
          options.url += '&originalCmd='+idata.originalCmd
          request(options, (error, response, body) =>{
                //if (error) throw new Error(error);


                try{
                  if(idata.originalCmd.indexOf('UPDATE')>-1 || idata.originalCmd.indexOf('DELETE')>-1){
                    const json = JSON.parse(body);
                    Object.assign(ret,{
                      "cmdArray": {
                          "cmdId": 0,
                          "cmd": "",
                          "cmdRet": "ID=0&Return=0&CMD="+idata.originalCmd,

                       },
                    });
                    res.json(ret);

                  }else{
                    this.getCommandStatus((json)=>{

                      Object.assign(ret,json);
                      res.json(ret);

                    })
                  }
                }catch(err){}



          });

        break;

        case 'realEvent':

          setTimeout(()=>{
            this._realEvent((json)=>{

              Object.assign(ret,json);
              res.json(ret);

            })
          },1000)
        break ;

        default:
          request(options, function (error, response, body) {
                if (error) throw new Error(error);

                //console.log(body);
                const json = JSON.parse(body)
                Object.assign(ret,json)
                res.json(ret)

          });
        break ;

      }


    }else{
      res.json({
        desc:'hook-error',
        message: params.method+' method not found'
      });
    }
  },

  _queryCommandStatus(onSuccess){
    request({
      method:'POST',
      url:PUSH_SERVER+'/cmdServlet'
    },(error,response,body)=>{

      try{
        const json = JSON.parse(body);
        json['cmdArray'] = json['cmdArray'][json['cmdArray'].length-1]

        onSuccess(json);

      }catch(err){
        onSuccess({desc:'fail'})
      }

      //res.json(ret)
    })
  },

  getCommandStatus(onSuccess){

    this._queryCommandStatus((json)=>{
      if(json.cmdData!==''){

        json.timeSpend = this.limitTime;
        this.limitTime = 0 ;
        onSuccess(json);
      }else{

        this.limitTime +=1;

        setTimeout(()=>{
          if(this.limitTime<30){
            this.getCommandStatus(onSuccess)
          }else{
            this.limitTime = 0 ;
            onSuccess(json);
          }

        },1000);

      }


    })

  },

  allowMethod(code){
    let ret = false ;
    const allowMethods = [
      'deviceServlet','createCmd','cmdServlet','realEvent','authorityServlet','timeServlet','empServlet'
    ];

    allowMethods.map((item)=>{
      if(code===item){
        ret = true ;
      }
    });

    return ret ;
  }
}


module.exports =  pushapi;
