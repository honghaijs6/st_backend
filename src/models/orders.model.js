// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const myTime = require('../hooks/ultil/myTime');

const MODE = 'orders';

module.exports = function (app) {

  // config Database
  const paginate = app.get('paginate');
  const sequelize = app.get('sequelizeClient');
  const Op = sequelize.Op

  const model = sequelize.define(MODE,
    {

     id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull: false,
        unique: true

     },

     code:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null

     },
     code_pi:{
      type:DataTypes.STRING,
      defaultValue:null
     },

     payment_code:{
       type:DataTypes.STRING,
       defaultValue:null,
       allowNull:true
     },

     print_num:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },

     creator_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },
     customer_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     customer_info:{
        type:DataTypes.TEXT,
        defaultValue:null
     },
     deleted_by:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     company_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     require_modify_price:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },

     // TRANG THAI ĐON HÀNG
     status:{
       type:DataTypes.TINYINT,
       defaultValue:0,
     },

     status_type:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },

     date_created:Sequelize.DATE,
     date_modified:Sequelize.DATE,
     date_deleted:Sequelize.DATE,

     date_approved:Sequelize.DATE,
     date_confirmed:Sequelize.DATE,
     date_out:Sequelize.DATE,
     date_progress:Sequelize.DATE,
     date_final:Sequelize.DATE,
     date_finish:Sequelize.DATE,

     cart:{
       type:DataTypes.TEXT,
       defaultValue:null
     },

     construction_team:{
       type:DataTypes.TEXT,
       defaultValue:null
     },

     total_sum:{
       type:DataTypes.DECIMAL('11,2'),
       defaultValue:0
     },

     total_sum_vat:{
        type:DataTypes.DECIMAL('11,2'),
        defaultValue:0
     },

     is_deleted:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },
     delete_reason_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },
     vat:{
       type:DataTypes.TINYINT,
       defaultValue:10
     },


     level_discount:{
       type:DataTypes.DECIMAL('11,2'),
       defaultValue:0
     },

     promotion_discount:{
       type:DataTypes.DECIMAL('11,2'),
       defaultValue:0
     },

     note:{
       type:DataTypes.STRING,
       defaultValue:null,
       allowNull:true
     },

     bill_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },
     bill_info:{
       type:DataTypes.TEXT,
       defaultValue:null
     },
     vat_invoice_info:{
       type:DataTypes.TEXT,
       defaultValue:null
     },
     warehouse_receipt_info:{
       type:DataTypes.TEXT,
       defaultValue:null
     },
     belong_user:{
       type:DataTypes.STRING,
       defaultValue:null
     }

    },

  );

  Object.assign(model,{

    _name:MODE,

    _maxPage:paginate.max,
    _page:0,
    _key:'',

    sort_by:'date_created',
    sort_type:'DESC',

    /* HTTP: GET METHOD*/
    listAll(filter,params){

      return new Promise((resolve,reject)=>{

        const {query} = params;

        this._maxPage = query.max || this._maxPage;
        this._page = query.p || 0   ;
        this._page = this._page * this._maxPage;

        this._key = query.key || '';


        this.sort_by = query.sort_by || this.sort_by;
        this.sort_by = this.sort_by === 'name' ? 'code' : this.sort_by;


        this.sort_type = query.sort_type || this.sort_type;

        /* ///////////////////////////////////////////////// */


        const isDel = query.is_deleted || 0 ;


        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start} 00:00:00' and ${this._name}.date_created <= '${query.end} 23:59:00'  ) `  : "";

        const selWithStatusType =  query.status_type !== undefined ?  parseInt(query.status_type) < 2 ?  ` AND ${this._name}.status_type = ${query.status_type} ` : '' : '';


        const selWithStatus =  query.status !== undefined ? ` AND ${this._name}.status= ${query.status}  ` : '';
        const selWithPaymentCode = query.payment_code !== undefined ?  ` AND ${this._name}.payment_code = '${query.payment_code}' ` : ''

        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} `


        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";



        let sql = ` SELECT
                      ${this._name}.*,
                      users.name as creator,
                      users.username as username,
                      payments.type as payment_type,
                      payments.debt_num as payment_debt,
                      payments.name as payment_name,
                      payments.detail as payment_desc


                  `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id
              WHERE (${this._name}.code LIKE '%${ this._key }%' or ${this._name}.code_pi LIKE '%${ this._key }%' or ${this._name}.customer_code LIKE '%${ this._key }%'  )

              ${selWithDate + selWithStatusType + selWithStatus + selWithPaymentCode + selWithIsDel }
          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  LEFT JOIN payments on payments.code = ${this._name}.payment_code


                  WHERE (
                          ${this._name}.code LIKE '%${ this._key }%' or
                          ${this._name}.code_pi LIKE '%${ this._key }%' or
                          ${this._name}.customer_code LIKE '%${ this._key }%'
                        )

                        ${selWithDate + selWithStatusType + selWithStatus + selWithPaymentCode + selWithIsDel }

                  ORDER BY ${this._name}.${this.sort_by} ${this.sort_type}

                  ${limit}
                 `
        }

        sql += arr_type_condition[filter];
        const countSQL = ` SELECT COUNT(*) AS cnt ${ arr_type_condition['count'] } `;


        sequelize.query(sql).spread((results, metadata) => {

          sequelize.query(countSQL).spread((count)=>{
              const data = {
                name:'success',
                count:count[0]['cnt'],
                rows:results,

              }

              resolve(data)
          })


        });


      })
    },
    _createCode(preCode){

      return new Promise((resolve,reject)=>{

          const m = myTime.getCurent.month();

          const month = myTime.getCurent.month();
          const year = myTime.getCurent.year();
          const date = myTime.getCurent.date();

          const ticketCode = preCode; //'inv - vk';
          const sqlOrderCode = preCode === 'inv' ? 'code_pi' : 'code';
          const sqlDateCode = preCode === 'inv' ? 'date_confirmed' : 'date_created';

          const start =  year+'-'+month+'-01 00:00:00'; // '2019-02-01 00:00:00'
          const end =  year+'-'+month+'-'+date+' 23:59:00'; // '2019-02-31 23:59:00'

          model.findOne({
            where: {
              [sqlOrderCode]: {
                [Op.like]: '%'+ticketCode+'-%'
              },
              [sqlDateCode]:{
                [Op.between]:[start,end]
              }
            },
            order:[
              [sqlOrderCode, 'DESC'],
            ],
            attributes: ['id',sqlOrderCode]
          }).then(idata => {

            let ret = {}
            let code = ticketCode+'-'+year+month+'-001';
            if(idata){

              const data = idata.dataValues ;
              let codePi = data[sqlOrderCode].substr(-3)
              let n = parseInt(codePi) + 1;

              if(n<10){
                  n = '00'+n;
              }else if(n>=10 && n<100){
                  n = '0'+n;
              }

              code = ticketCode+'-'+year+month+'-'+n;


            }
            resolve(code);
          });

      })
    },

    getInfoWithCode(code){
      return new Promise((resolve,reject)=>{

        const query = ` SELECT  ${this._name}.*,
                        users.name as creator,
                        payments.type as payment_type

                        FROM ${this._name}

                        LEFT JOIN users on users.id = ${this._name}.creator_id
                        LEFT JOIN payments on payments.code = ${this._name}.payment_code

                        WHERE ${this._name}.code_pi = '${code}'
                      `;
        sequelize.query(query).spread((results, metadata) => {

          const data = results.length > 0 ? results[0] : {}
          resolve(data);

        });

      });
    },
    getInfo(id){
      return new Promise((resolve,reject)=>{

        const query = ` SELECT  ${this._name}.*,
                        users.name as creator,
                        payments.type as payment_type

                        FROM ${this._name}

                        LEFT JOIN users on users.id = ${this._name}.creator_id
                        LEFT JOIN payments on payments.code = ${this._name}.payment_code

                        WHERE ${this._name}.id = ${id}
                      `;
        sequelize.query(query).spread((results, metadata) => {

          const data = results.length > 0 ? results[0] : {}
          resolve(data);

        });

      });
    },
    // cURL : http://localhost:3333/products/isExisted?code=xxx
    isExisted(code){

       return new Promise((resolve,reject)=>{

          model.findOne({
            where: { code: code},
            attributes: ['id']
          }).then(idata => {

            const data = idata || {};
            const ret = {
              name:"success",
              message:JSON.stringify(data)==="{}" ? "no" : "yes"
            }
            resolve( ret );

          });

       })
    }
    /* END HTTP GET METHOD*/

  });

  return model;

};
