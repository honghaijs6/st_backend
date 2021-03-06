/*
DEPARTMENTS
cURL
		GET
      - /           method find(params)  : custom
      - /{id}       method get(id,params): custom
    POST
      - /authentication           method authenticate() : default
      - /                         method create() : custom
    PUT

    DEL
*/

const mode = 'serials';

const { Service } = require( 'feathers-sequelize');
const mModel = require('../../models/'+mode+'.model');

class iRoute extends Service {


    /* GET DATA INFO || CALL METHOD WITH GET HTTP REST*/
    async get(id,params){
        //const data = await this.Model.getInfo(id);

        let ret = {
          name:"error",
          message:"",
        };
        const { query, route } = params ;
        if(JSON.stringify(route)==="{}"){
          ret.message = "Vui lòng kiểm tra thông số .. "
        }else{
          ret = route ;
          ret = await this.Model[route.method](id,params) ;

        }

        return ret


    }
    /* METHOD CRUD */
    async find(params){

      /* GOT HOOKED BEFOR : => Default schema from app main Object*/
      const schema = params.schema ;



      let data = await this.Model.findAndCountAll(schema);

      Object.assign(data,{
        userInfo:params.userInfo
      });

      return  data ;

    }

    /* cURL POST */
    async create(data,params){

        /* cleart all fields null  */
        const data_out = params.data ; // BE HOOKED BEFORE

        const resCheck = await this.Model.isExisted(data.code);

        if(resCheck.message==='no'){

          if(data_out.name==='success'){
            data_out.data = data_out.name==='success' ?  await this.Model.create(data) : data_out.data ;
            Object.assign(data_out,{
              userInfo:params.userInfo
            });

          }

        }else{
          
          data_out.message = 'Mã này đã được sử dụng';
          data_out.name = 'hook-error';
          data_out.error = resCheck ;
        }

        return data_out;

    }

    async verify(data,params){

      let ret = {
        name:'hook-error',
        message:''
      };

      if(data.code !== undefined){

        const resVerify = await this.Model.isVerify(data.code) ;

        if(resVerify.message==='no'){
          const isSuccess = await this.Model.update({
            status:1,
            ...data
          },{
            where:{
              code:data.code
            }
          });
          ret.name = isSuccess[0] > 0 ? 'ok' : 'fail';

        }else{ ret.message = 'Số serial/emei này đã bán'  }



      }else{ ret.message = 'Vui lòng xem lại mã serial/emei' }


      return ret;

    }

    async update(id,data,params){
      /* be hooked before : to get condition schema for update database from params query*/
      let ret = params.data ;
      const { condition } = params.data ;

      if(params.isMethod){

         ret =  this[params.data.method](data,params);

      }else{

        // AFTER FOLLOW HOOKED FIRST
        if(ret.name==='success'){

          const isSuccess = await this.Model.update(data,condition);
          ret.name = parseInt(isSuccess[0]) > 0 ? 'success' : 'fail-update' ;

          Object.assign(ret,params.data);

          Object.assign(ret,{
            userInfo:params.userInfo
          });
        }

      }

       return ret ;
    }
    /* cURL : DELETE */
    async remove(id, params ){

        /* be hooked before => data for update*/
        let idata = params.data ;

        const isSuccess = await this.Model.update(idata.data,{
          where:{
            id:id
          }
        });

        idata.name = parseInt(isSuccess[0]) > 0 ? 'success' : 'fail-remove';

        Object.assign(idata,{
          userInfo:params.userInfo
        });

        return idata;
    }

    /* CUSTOM METHOD ON UPDATE HTTP*/
    async test(data,params){

      let ret = await this.Model.getInfo(12);

      return ret


    }



  }

  /* options : app - hook - event */
  module.exports = function (options) {
    const app = options.app;
    const Model = mModel(app);
    const paginate = app.get('paginate');


    const sequelize = {
        Model,
        paginate
    }


    return new iRoute(sequelize);

  };

  module.exports.Service = iRoute;
