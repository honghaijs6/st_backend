
var readline = require('readline');
var stream = require('stream');


let comands = [];

let COUNT = 1 ;


class DeviceMeetServer {


  constructor(){

    this._isRegiter  = false
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

  doPost(req,res){

    let retValue = 'OK';
    res.header("Content-Type", "text/plain;charset=UTF-8");

    const params = req.params;
    const query = req.query;


    console.log(params);

    try{

      switch(params.param){

        case 'cdata':
           console.log('cdata======') ;
           console.log(query) ;

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

                this._getStreamData(req,(line)=>{
                  const url = line.replace(/\t/g,"&");
                  const json = this.conUrlToJson(url);

                  console.log(json) ;

                })

              break;

              case 'rtlog':
                console.log("***************/cdata type=rtlog  || post device's event to server***************");

                console.log(req);



                this._getStreamData(req,(line)=>{
                    //console.log(line) ;
                    const url = line.replace(/\t/g,"&");
                    const json = this.conUrlToJson(url);

                    console.log(json) ;

                    if(json.cardno !=="0"){
                      console.log(" =============== QUET THE ==================") ;

                      retValue = "C:"+COUNT+":CONTROL DEVICE 01010101" ;
                      comands.push(retValue) ;
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

           console.log("REGISTRY")

           if(!this._isRegiter){
              console.log('***************/registry  || Start to regist***************');
              retValue = "RegistryCode=Uy47fxftP3" //+query.SN ;
              console.log("has been registed，register code : Uy47fxftP3") ;
              this._isRegiter = true ;
           }else{
              retValue = "RegistryCode=Uy47fxftP3"//+query.SN ;
              //console.log("has registed :"+query.SN) ;
           }



        break ;

        case 'push':

          console.log("PUSH ME")
          console.log('***************/push  || device get parameters from server***************');
          retValue = "ServerVersion=1.0\nServerName=VKServer\nPushVersion=5.6\nErrorDelay=1\nRequestDelay=2\nTransTimes==00:0023:59\nTransInterval=1\nTransTables=User\tTransaction\nRealtime=1\nSessionID="+req.sessionID+"\nTimeoutSec=1";

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

          /*this._getStreamData(req,(line)=>{

            console.log(line) ;

          })*/

        break ;

        case 'querydata':
            console.log("***************/querydata  ||response the server with person data that server asked***************")
        break ;

        default :
          console.log("***************unknown request:"+params.param+"***************") ;
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


  // GET : RESPONE FOR DEVICE
  /*
    CDATA -->
    <----
    PUSH

  */
  doGet(req,res){

      /*res.header("Content-Type", "text/plain;charset=utf-8");

      let retValue = 'OK';
      const params = req.params;
      const query = req.query;

      console.log('===== GET =====') ;
      switch(params.params){

        case 'push':
          retValue = "ServerVersion=3.1.1\nServerName=ADMS\nPushVersion=3.2.0\nErrorDelay=60\nRequestDelay=5\nTransTimes=00:00  14:00\nTransInterval=1\nTransTables=User  Transaction\nRealtime=1\nSessionID=d8y8o75hgn"
        break ;

        default:

        break ;
      }
      res.send(retValue);


      console.log("==== END GET ====") ;*/





  }
}

module.exports =  new DeviceMeetServer();