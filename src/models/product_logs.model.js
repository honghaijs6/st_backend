// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const myTime = require('../hooks/ultil/myTime');

const MODE = 'product_logs';

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

     warehouse_receipt_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },
     purchase_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },
     order_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },
     supplier_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },
     customer_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     creator_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     company_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     product_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     // IN - OUT
     type:{
       type:DataTypes.STRING,
       defaultValue:'in'
     },

     balance:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     date_created:Sequelize.DATE,

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
        const withKey = this._key === '' ?  ` is null ` : ` LIKE '% ${this._key} %' `;

        this.sort_by = query.sort_by || this.sort_by;
        this.sort_type = query.sort_type || this.sort_type;

        /* ///////////////////////////////////////////////// */

        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start}' and ${this._name}.date_created <= '${query.end}'  ) `  : "";
        const selWithProCode = query.product_code !== undefined ? ` AND ${this._name}.product_code = '${ query.product_code }'  ` : '';
        const selWithType  = query.type !==  undefined ? ` AND ${this._name}.type = '${query.type}' ` : ''


        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT
                      ${this._name}.*,

                      warehouse_receipts.warehouse_code as warehouse_code,
                      users.name as creator

                   `;

        const arr_type_condition = {
          "count":`
              FROM ${this._name}

              LEFT JOIN users on users.id = ${this._name}.creator_id
              WHERE ( ${this._name}.warehouse_receipt_code ${ withKey } or ${this._name}.purchase_code ${withKey} or ${this._name}.order_code ${withKey} or ${this._name}.supplier_code ${withKey} or ${this._name}.customer_code ${withKey}  )

              ${ selWithProCode + selWithType + selWithDate }

          `,
          "all": `
              FROM ${this._name}

              LEFT JOIN users on users.id = ${this._name}.creator_id
              LEFT JOIN warehouse_receipts on warehouse_receipts.code_in =  ${this._name}.warehouse_receipt_code or warehouse_receipts.code_out =  ${this._name}.warehouse_receipt_code


              WHERE ( ${this._name}.warehouse_receipt_code ${ withKey } or ${this._name}.purchase_code ${withKey} or ${this._name}.order_code ${withKey} or ${this._name}.supplier_code ${withKey} or ${this._name}.customer_code ${withKey}  )
              ${ selWithProCode + selWithType + selWithDate }
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

              resolve(data);
          })


        });


      })
    },

    getInfo(id){
      return new Promise((resolve,reject)=>{

        const query = ` SELECT * from ${this._name}
                        WHERE id = ${id}
                      `;
        sequelize.query(query).spread((results, metadata) => {

          const data = results.length > 0 ? results[0] : {}
          resolve(data);

        });

      });
    },
    // cURL : http://localhost:3333/products/isExisted?code=xxx


  });

  return model;

};
