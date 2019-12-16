
/*
  Guy :  thêm field mặc định : date_modified
        => assign date_modified => data
        => trả về : hook data; cấu trúc mới
*/

module.exports = function (options = {}) {
  return async context => {

    let {data} = context;

    Object.assign(data,{
      date_modified:new Date()
    })

    return context;
  };
};
