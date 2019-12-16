
/* feathers DB supporter */
const { Service } = require( 'feathers-sequelize');
/* DB schema for filter IN - OUT */
const mUser = require('../../models/users.model');

class User extends Service {


    constructor(options) {
      super(options)

    }
    setup(app,path){
      this.app = app;

    }


    /* GET DATA INFO || CALL METHOD WITH GET HTTP REST*/
    async get(id,params){
        //const data = await this.Model.getInfo(id);

        let ret = {
          name:"error",
          message:"",
        };
        const { query, route } = params ;
        if(JSON.stringify(route)==="{}"){
          ret.message = "Vui lòng kiểm tra thông số .. ";

          // IS TEXT?
          if(!isNaN(id)){
            ret = super.get(id,params);
          }

        }else{

          // PASS ALL TO MODEL ROUTE
          if(route !== undefined){
            ret = route ;
            ret = await this.Model[route.method](id,params) ;
          }else{ ret = super.get(id,params); }


        }

        return ret


    }

    /* METHOD CRUD */
    /* cURL: GET */
    async find(params){


      /* GOT HOOKED BEFOR : => Default schema from app main Object*/
      const query = params.query;
      const schema = params.schema ;

      let data  ;
      if(query.$limit !== undefined){
        // THIS USE DEFAULT FIND FOR AUTHENTICATION
        data = await super.find(params);
      }else{

         data = await this.Model.findAndCountAll(schema);
         Object.assign(data,{
            name: 'success',
            userInfo:params.userInfo
          });

      }
      return data;

    }
    /* cURL : END GET  */

    /* cURL POST */
    async create(data,params){


        /* cleart all fields null  */
        const data_out = params.data ; // BE HOOKED BEFORE

        // CHECK EXISTED E-MAIL
        const retCheck = await this.Model.isExisted(data.email) ;


        if(retCheck.message==='no'){

            if(data_out.name==='success'){
              // GET USER CODE FIRST
              //data.code = await this.Model._createCode('k');
              data_out.data = data_out.name==='success' ?  await this.Model.create(data) : data_out.data ;
              // LOAD LASTEST ROWS
              const rows = await this.Model.listAll('all',{query:{
                max:1
              }});
              data_out.data = rows.rows[0];

            }


        }else{
          Object.assign(data_out,{
            name:'hook-error',
            message:'E-mail này đã tồn tại'
          });
        }


        return data_out;


    }

    // HTTP UPDATE .
    async test(data,params){

      return {
        name:"callmethod",
        message:"calling method",
        data:{}

      }
    }

    async changePassword(data,params){

      let ret = {
        name:'error-changePassword:user',
        message:'',
        data:{}
      }

      
      return ret ;
    }

    async update(id,data,params){

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

  }


  module.exports = function (options) {

    const app = options.app ;
    const Model = mUser(app);
    const paginate = app.get('paginate');
    return new User({Model,paginate});

  };

  module.exports.Service = User;
