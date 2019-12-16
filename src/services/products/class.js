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

const mode = 'products';
const MODE_NAME = 'Sản phẩm';


const { Service } = require( 'feathers-sequelize');
const mModel = require('../../models/'+mode+'.model');

class iRoute extends Service {


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
        name: 'success',
        userInfo:params.userInfo
      });

      return  data ;

    }


    /* cURL POST */
    async create(data,params){

        /* cleart all fields null  */
        const data_out = params.data ; // BE HOOKED BEFORE

        // KIEM TRA CODE TRÙNG
        const ret = await this.Model.isExisted(data.code);


        if(ret.message==='no'){

            if(data_out.name==='success'){


              data_out.data = data_out.name==='success' ?  await this.Model.create(data) : data_out.data ;
              // LOAD LASTEST ROWS
              const rows = await this.Model.listAll('all',{query:{
                  max:1
              }});
              data_out.data = rows.rows[0];

              Object.assign(data_out,{
                userInfo:params.userInfo
              });
            }

        }else{
          data_out.message = "Mã "+MODE_NAME+" này đã tồn tại";
          data_out.name = "hook-error"
        }


        return data_out;

    }


    async unfollow(data,params){

      let ret = {
        name:'hook-error',
        message:''
      }

      if(data.id !==undefined){
        const info = await this.Model.getInfo(data.id);
        let follow_list = info['follow_list'].replace(new RegExp('@'+data.code, 'g'),'') ;

        const updateData = {
          follow_list:follow_list
        }

        const isSuccess = await this.Model.update(updateData,{
          where:{
            id:parseInt(data.id)
          }
        });

        ret.name = parseInt(isSuccess[0]) > 0 ? 'ok' : 'fail-update' ;
        ret.data = Object.assign(info,updateData);


      }else {  ret.message = 'missing ID '; }

      return ret;

    }

    async follow(data,params){

       let ret = {
         name:'hook-error',
         message:''
       }

       //let isSuccess;

       if(data.id !==undefined){
         const info = await this.Model.getInfo(data.id);
         let follow_list = info['follow_list'] === null ? '':info['follow_list'] ;
         follow_list += '@'+data.code ;

         const updateData = {
           follow_list:follow_list
         }

         let isSuccess = await this.Model.update(updateData,{
           where:{
             id:parseInt(data.id)
           }
         });
         //ret.name = isSuccess[0] > 0  ? 'sda':'';
         ret.name = isSuccess[0] > 0 ? 'ok' : 'fail-update' ;
         ret.data = Object.assign(info,updateData);


       }else {  ret.message = 'missing ID '; }



       return ret;

    }

    /*
    CẬP NHẬT SỐ LIỆU CHO SẢN PHẨM
    total_available
    total_received
    total_shiped
    total_onhand
    json = {id:0,total_available:0}
    */
    async updateProductTotal(json,params){

      let ret = {
        name:'hook-error',
        message:''
      }

      if(json.id !== undefined){

          //const mProduct = this.app.service('products'); //this.app.service('products');

          const info = await this.Model.getInfo(json.id);
          const field = Object.keys(json)[1]; //  get field keys

          const endTotal = json.type === 'in' ? parseInt(info[field]) + parseInt(json[field]) : parseInt(info[field]) - parseInt(json[field]);

          const updateInfo = {
            [field]: endTotal
          };

           const isSuccess = await this.Model.update(updateInfo,{
            where:{
              id:json.id
            }
          });

          ret.name = parseInt(isSuccess[0]) > 0 ? 'ok' : 'fail-update' ;


      }else{ ret.message = 'Missing json.id' }


      return ret;
    }



    async update(id,data,params){

      /* be hooked before : to get condition schema for update database from params query*/
      let ret = {};


      if(params.isMethod){

         ret =  this[params.data.method](data,params);

      }else{

        ret = params.data ;

        // AFTER FOLLOW HOOKED FIRST
        if(ret.name==='success'){

          const {condition} = ret;

          const isSuccess = await this.Model.update(data,condition);
          ret.name = parseInt(isSuccess[0]) > 0 ? 'success' : 'fail-update' ;

          const info =  await this.Model.getInfo(data.id) ;
          ret.data = info ;


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
      //let ret = await this.Model.getInfo(12);
      return data;
    }



    /* end customer method*/



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
