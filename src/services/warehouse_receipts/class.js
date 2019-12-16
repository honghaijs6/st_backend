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

const mode = 'warehouse_receipts';

const { Service } = require( 'feathers-sequelize');
const mModel = require('../../models/'+mode+'.model');




class iRoute extends Service {



  setup(app){
      this.app = app ;
      this.curIndex = 0
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
      userInfo:params.userInfo
    });

    return  data ;

  }

  /* cURL POST */
  async create(data,params){

      /* cleart all fields null  */
      const data_out = params.data ; // BE HOOKED BEFORE

      if(data_out.name==='success'){

        // CREATE FOR NHẬP - XUẤT
        if(data.type==='in'){
          data.code_in = await  this.Model._createCode('di') ;
        }else{
          data.code_out = await this.Model._createCode('do');
        }
        data_out.data = data_out.name==='success' ?  await this.Model.create(data) : data_out.data ;
        // KIÊM TRA STATUS CỦA ĐƠN HÀNG

        // LOAD LASTEST ROWS
        const rows = await this.Model.listAll('all',{query:{
            max:1
        }});
        data_out.data = rows.rows[0];

        // CẬP NHẬT LƯỢNG HÀNG TỒN SẢN PHẨM : NÉU TRẠNG THÁI HOÀN THÀNH
        if(parseInt(data.status)>0){
          await this._updateStatus(data_out.data,params);
        }


        Object.assign(data_out,{
          userInfo:params.userInfo
        });

      }


      return data_out;

  }

  // CANCEL PHIẾU
  async cancel(data,params){

    let ret = {
      name:'hook-error',
      message:'',
      data:{},
      id: data.id,
      type: "remove",
      model: "warehouse_receipts"
    }

    if(data.id !== undefined && data.delete_reason_id	!== undefined){

      const userInfo = params.userInfo;

      const updateData = {
        date_deleted : new Date(),
        is_deleted: 1,
        deleted_by: userInfo.id,
        delete_reason_id : data.delete_reason_id

      }

      const isSuccess = await this.Model.update(updateData,{
        where:{
          id:data.id
        }
      });
      ret.name = parseInt(isSuccess[0]) > 0 ? 'ok' : 'fail-update' ;
      const info =  await this.Model.getInfo(data.id) ;
      ret.data = info ;

      Object.assign(ret,{
        userInfo:params.userInfo
      });

    }else{ ret.message = 'Vui lòng kiểm tra thông tin'; }


    return ret ;
  }


  /*
  CẬP NHẬT LƯỢNG SẢN PHẨM
  DATA  : warehouse_receipts ITEM,

  */
  async _updateStatus(data,params){
    const mProduct = this.app.service('products');

    const userInfo = params.user ;

    if(data.cart !== undefined){

      const cart = JSON.parse(data.cart);
      const type = data.type ;


      if(this.curIndex < cart.length ){

        // UPDATE PRODUCT TOTAL total_available
        const cartJson = cart[this.curIndex];

        const ret = await mProduct.updateProductTotal({
          id:cartJson.id,
          total_available:cartJson.amount,
          type:type
        },params);

        if(ret.name==='ok'){

          // CREATE PRO_LOGS
          const mProductLogs = this.app.service('product_logs');
          const resProLog =  await mProductLogs.create({
            warehouse_receipt_code: type === 'in' ? data.code_in : data.code_out,
            purchase_code:data.purchase_code,
            order_code:data.order_code,
            supplier_code:data.supplier_code,
            supplier_info:data.supplier_info,
            customer_code:data.customer_code,
            customer_info:data.customer_info,
            product_code:cartJson.code,
            balance:cartJson.amount,
            creator_id:userInfo.id,
            company_id:userInfo.company_id,
            type:type
          },params);

          // ĐỆ QUI LẦN NỬA
          if(resProLog.name ==='success'){

            this.curIndex +=1 ;
            await this._updateStatus(data,params);

          }


        }
      }else{ this.curIndex = 0 ;  }

    }



  }
  // UPDATE PHIẾU
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

        const info = await this.Model.getInfo(data.id);
        ret.data = info ;


        // CẬP NHẬT LƯỢNG HÀNG TỒN SẢN PHẨM : NÉU TRẠNG THÁI HOÀN THÀNH
        if(parseInt(data.status)>0){
          await this._updateStatus(info,params);
        }



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
