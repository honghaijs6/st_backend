
/*
gắng thêm các field mặc định cho method POST : CREATE
*/

module.exports = function (options = {}) {
  return async context => {

    let { data } = context;
    let { user } = context.params


    try{
      Object.assign(data,{
        creator_id:user.id,
        company_id:user.company_id
      });

    }catch(err){ throw err }

    return context;

  };
};
