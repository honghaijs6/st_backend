
/*
gắng thêm các field mặc định cho method POST : CREATE
*/

module.exports = function (options = {}) {
  return async context => {

    let { data } = context;
    let { user } = context.params


    try{
      Object.assign(data,{
        creator_id:0,
        company_id:0
      });

    }catch(err){ throw err }

    return context;

  };
};
