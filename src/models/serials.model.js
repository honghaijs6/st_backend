// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const myTime = require('../hooks/ultil/myTime');


const MODE = 'serials';

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
       defaultValue:null
     },

     warehouse_receipt_code_in:{
       type:DataTypes.STRING,
       defaultValue:null
     },
     warehouse_receipt_code_out:{
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

     product_code:{
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

     // 0: CÒN HÀNG - 1 ĐÃ BÁN
     status:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },
     // IN - OUT
     type:{
       type:DataTypes.STRING,
       defaultValue:'in'
     },


     date_created:Sequelize.DATE,
     date_modified:Sequelize.DATE,

     date_sell:Sequelize.DATE,


    }
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
        this.sort_type = query.sort_type || this.sort_type;

        /* ///////////////////////////////////////////////// */


        const isDel = query.is_deleted || 0 ;


        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start}' and ${this._name}.date_created <= '${query.end}'  ) `  : "";
        const selWithProCode = query.product_code !== undefined ? ` AND ${this._name}.product_code = '${query.product_code}' ` : ''


        const selWithType = query.type !== undefined ?  ` AND  ${this._name}.type = '${query.type}' `  : "";
        const selWithStatus = query.status !== undefined ?  ` AND  ${this._name}.status = ${query.status} `  : "";


        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT  ${this._name}.*, users.name as creator `;

        const arr_type_condition = {

          "count":`

              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id
              WHERE ( ${this._name}.code LIKE '%${this._key}%' )
              ${selWithDate + selWithStatus + selWithProCode + selWithType   }

          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  WHERE ( ${this._name}.code LIKE '%${this._key}%' )

                  ${selWithDate + selWithProCode + selWithStatus + selWithType   }

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

    isVerify(code){
      return new Promise((resolve,reject)=>{

        const query = ` SELECT ${this._name}.status
                        FROM ${this._name}
                        WHERE ${this._name}.code = '${code}' AND ${this._name}.status = 1
                      `;
        sequelize.query(query).spread((results, metadata) => {

          const msg = results.length > 0 ? 'yes' : 'no'
          resolve({
            message:msg
          });

        });

      });
    },

    getInfo(id){
      return new Promise((resolve,reject)=>{

        const query = ` SELECT ${this._name}.*,
                          users.name as creator
                          from ${this._name}
                          LEFT JOIN users  on users.id = ${this._name}.creator_id

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
