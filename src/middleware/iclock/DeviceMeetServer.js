
const mCoupon = require('../../models/coupons.model') ;

var readline = require('readline');
var stream = require('stream');


let comands = [];
let DELETE_DB_CMD = [] ;

let COUNT = 1 ;


class mDeviceMeetServer {


  constructor(app){

    this.app = app ;
    this._isRegiter  = false;

    this.moCoupon = mCoupon(app) ;

  }
  _getStreamData(req,onSuccess){

    //const stream = request.getInputStream();
    const data = req.body ;
    var buf = new Buffer.from(data);

    var bufferStream = new stream.PassThrough();
    bufferStream.end(buf);

    var rl = readline.createInterface({
      input: bufferStream,
    });


    rl.on('line', function (line) {
        //console.log('this is ' + (++count) + ' line, content = ' + line);

        onSuccess(line) ;
        //console.log(line)

    });

  }

  conUrlToJson(str){

    return JSON.parse('{"' + decodeURI(str).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"').replace(/\s/g,'') + '"}')
  }
  // POST : RESPONE FOR DEVICE INTERACT
  /*
    -cdata
    -registry
    -push


  */



  /*
  VERIFY WITH DATABASE
  */
  _doVerifyTicket(json){


    this.moCoupon.getInfoByCode(json.cardno).then((res)=>{
      const info = res.data ;
      //const count = parseInt(info.used_count) + 1 ;
      if(info.id !== undefined ){

        // REMOTE OPEN HERE
        const door = json.eventaddr ;
        const retValue = "C:"+COUNT+":CONTROL DEVICE 010"+door+"0101" ;
        comands.push(retValue) ;

        DELETE_DB_CMD.push({
          id:info.id,
          cardno:json.cardno
        });

      }
    }).catch((err)=>{
      console.log(err) ;
    })

  }

  _doDeleteCardOnDevice(json){

    try{
      const retValue = "C:"+COUNT+":DATA DELETE user Pin="+json.pin+"\r\n";
      comands.push(retValue) ;

    }catch(err){}



  }


  _parseDevState(json){

    const lockCount = 4 ;


		const sensor = this._getBinary(json.sensor, lockCount, 2, false);
    //relay = getBinary(relay, lockCount, 1, false);

    //door=getBinary(door, lockCount, 8, false);

    return {
      sensor
    }

  }
  _getBinary(hexStrValue="", lockCount=4, bitConvert=1, reverse=true){

    var setValue = "";
                var intValue = 0;
                if (reverse) {
                    var validLetterLen = (bitConvert * lockCount / 4 | 0);
                    for (var i = 0; i < (validLetterLen / 2 | 0); i++) {
                        {
                            setValue += hexStrValue.substring(validLetterLen - (i + 1) * 2, validLetterLen - i * 2);
                        }
                        ;
                    }
                    intValue = parseInt(setValue, 16);
                }
                else {
                    intValue = parseInt(hexStrValue, 16);
                }
                var ret = "";
                var sum = 0;
                for (var i = 0; i < bitConvert; i++) {
                    {
                        sum += Math.pow(2, i);
                    }
                    ;
                }
                for (var i = 0; i < lockCount; i++) {
                    {
                        if ((function (o1, o2) { if (o1 && o1.equals) {
                            return o1.equals(o2);
                        }
                        else {
                            return o1 === o2;
                        } })("", ret)) {
                            ret += (intValue & sum);
                        }
                        else {
                            ret += "," + ((intValue >> bitConvert * i) & sum);
                        }
                    }
                    ;
                }
                return ret;
  }


  _createRegCode(sn){

    let text = sn.split("").reverse().join("");
    text = text.substring(0,10);
    text = text.split("").reverse().join("");
    return text;


  }
  doPost(req,res){

    let retValue = 'OK';
    res.header("Content-Type", "text/plain");

    const params = req.params;
    const query = req.query;


    //console.log(params);


    try{

      switch(params.param){

        case 'cdata':


           let type = query.table ;
           if(type == null && query.AuthType != null){
              type = "BGV";// background verification
           }

           type = type == null ? "isConnect" : type;


           switch (type){

              case "isConnect":
                 console.log("***************/cdata type=isconnect  || first step: set up connections between device and server***************") ;

              break;

              case 'rtstate':

                console.log("***************/cdata type=rtstate  || post device's state to server***************") ;

                /*this._getStreamData(req,(line)=>{
                })*/

              break;

              case 'rtlog':
                console.log("***************/cdata type=rtlog  || post device's event to server***************");

                //console.log(req);


                this._getStreamData(req,(line)=>{
                    //console.log(line) ;
                    const url = line.replace(/\t/g,"&");
                    const json = this.conUrlToJson(url);

                    console.log(json) ;

                    if(json.cardno !=="0"){

                      if(json.pin==="0"){
                        console.log(" =============== QUET TICKET ==================") ;
                        this._doVerifyTicket(json) ;

                      }else{
                        console.log(" =============== QUET THE ==================") ;

                        this._doDeleteCardOnDevice(json)

                      }

                      //retValue = "C:"+COUNT+":CONTROL DEVICE 01010101" ;
                      //comands.push(retValue) ;
                    }


                }) ;


              break;

              case "BGV":

                console.log("***************/cdata type=BGV  || background verification***************") ;
                console.log("◎background verification : "+query.AuthType) ;

                this._getStreamData(req,(datas)=>{
                  console.log("\t device event data："+datas) ;
                });



              break ;

              default :
                console.log("***************/cdata type=unknown  || request:"+type+"***************")
              break;


           }


        break;

        case 'registry':

           console.log("========REGISTRY=============") ;
           const regCode = this._createRegCode(query.SN);



           if(!this._isRegiter){
              console.log('***************/registry  || Start to regist***************');



              retValue = "RegistryCode="+regCode //+query.SN ;
              console.log("====sn: "+query.SN)
              console.log("has been registed，register code : "+regCode) ;
              this._isRegiter = true ;
           }else{
              retValue = "RegistryCode="+regCode;//+query.SN ;
              //console.log("has registed :"+query.SN) ;
           }



        break ;

        case 'push':

          console.log("PUSH ME")
          console.log('***************/push  || device get parameters from server***************');
          retValue = "ServerVersion=1.0\nServerName=VKServer\nPushVersion=5.6\nErrorDelay=1\nRequestDelay=1\nTransTimes==00:0023:59\nTransInterval=1\nTransTables=User\tTransaction\nRealtime=1\nSessionID="+req.sessionID+"\nTimeoutSec=1";

        break;

        case 'getrequest':
          console.log('device say : give me instructions');
          //retValue = "CONTROL\tDEVICE\t01010106" ;
          //comands.push(retValue) ;

          //retValue = "seen";
          //res.send("C:101: CONTROL DEVICE 01010103");




        break;

        case 'devicecmd':
          console.log("***************/devicecmd  || return the result of executed command to server***************") ;

          this._getStreamData(req,(line)=>{

            const url = line.replace(/\t/g,"&");
            const json = this.conUrlToJson(url);

            try{

              console.log(json);
              if(parseInt(json.Return) >= 0){

                if(DELETE_DB_CMD.length > 0){

                  const item = DELETE_DB_CMD[0];
                  this.moCoupon.destroy({
                    where:{
                      id:item.id
                    }
                  }).then((res)=>{
                    console.log("======delete DB success=========");
                    DELETE_DB_CMD.shift();
                  });
                }
              }

            }catch(err){
              console.log("================ ERROR RETURN FROM DEVICE") ;
            }

          })

        break ;

        case 'querydata':
            console.log("***************/querydata  ||response the server with person data that server asked***************")
            this._getStreamData(req,(line)=>{
              const url = line.replace(/\t/g,"&");
              const json = this.conUrlToJson(url);
              console.log(json) ;

              console.log("===========END QUERY ===========================") ;
            });
        break ;

        default :
          console.log("***************unknown request: **************") ;
          //retValue = "404";

        break ;


      }
    }catch(err){
      retValue = "404";

      console.log("===ROROROROOROR==================")
    }



    if(retValue!=='seen'){
      res.status(200)
      if(comands.length >0){
          retValue = comands[0];
          comands.shift();
      }
      res.send(retValue);
      COUNT+=1 ;
      console.log(":::: cureent retValue:"+retValue);
      console.log("COUNT : "+COUNT)
    }else{
      console.log(" :: SEEN DIRECT :::")
    }


  }



}

module.exports =   mDeviceMeetServer;
