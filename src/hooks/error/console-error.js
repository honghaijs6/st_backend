/*
  THIS FUNCTION :
    SHOW CONSOLE ERROR : FOR INDICATING MYSQL ERROR

*/


module.exports = function(options={}){

  return async (context)=>{

    console.log("====== HOOK ERROR=========");
    console.error(context.error);
    console.log("=======END HOOK ERROR=========");

    return context;
  }
}
