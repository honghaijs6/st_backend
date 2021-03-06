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

const mode = 'customers';

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
        const data_out = params.data ; // BE HOOKED BEFOR E
        const retCheck = await this.Model.isExisted(data.code) ;


        if(retCheck.message==='no'){

          if(data_out.name==='success'){
              data_out.data = data_out.name==='success' ?  await this.Model.create(data) : data_out.data ;

              const rows = await this.Model.listAll('all',{query:{ max:1}});
              data_out.data = rows.rows[0];

              Object.assign(data_out,{
                userInfo:params.userInfo
              });

          }
        }else{
          data_out.message = 'Mã khách hàng này đã được sử dụng';
          data_out.name = 'hook-error';
          data_out.error = retCheck ;
        }



        return data_out;

    }

    async update(id,data,params){

      /* be hooked before : to get condition schema for update database from params query*/
      let ret = {};

      const { condition } = params.data ;
      if(params.isMethod){

         ret =  this[params.data.method](data,params);

      }else{

        const isSuccess = await this.Model.update(data,condition);

        ret.name = parseInt(isSuccess[0]) > 0 ? 'success' : 'fail-update' ;
        const info =  await this.Model.getInfo(data.id) ;
        ret.data = info ;
        
        Object.assign(ret,{
          userInfo:params.userInfo
        });

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
