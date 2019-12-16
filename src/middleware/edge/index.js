

var edge = require('edge-js');

const edgeRoute = (app)=>{

  // TEST ONLY
  app.get('/edge',(req,res)=>{


    var path = __dirname+'\\Interop.zkemkeeper.dll';
    
    var test = edge.func({
      source: function () {/*


            using System;
            using System.Threading.Tasks;
            
            
            public class Startup
            {      
                public zkemkeeper.CZKEMClass axCZKEM1 = new zkemkeeper.CZKEMClass();
                
                public async Task<object> Invoke(object input)
                {
                    bool bIsConnected = false;
                    bIsConnected = axCZKEM1.Connect_Net("192.168.1.118",4370);
                    

                    return bIsConnected ;
                }
            }




      */},
        references: [path]
    });

    test('',function(error,result){
      console.log('====================================');
      console.log(result);
      console.log('====================================');
    });
    

    /*var helloWorld = edge.func(`  
        async (input) => {
            return ".NET Welcomes " + input.ToString();

        }
    `);

    helloWorld('Benjamin from NodeJS', function (error, result) {
        if (error) throw error;
        console.log(result);
    });*/



    res.send('ok')
  })
}

module.exports = edgeRoute
