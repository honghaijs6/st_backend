// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const myTime = require('../hooks/ultil/myTime');

const MODE = 'purchases'

module.exports = function (app) {

  // config Database
  const paginate = app.get('paginate');
  const sequelize = app.get('sequelizeClient');
  const Op = sequelize.Op

  // define table object
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

     payment_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     /* Trạng thái đơn hàng */
     status:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },

     is_deleted:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },

     delete_reason_id:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },

     supplier_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },
     supplier_info:{
       type:DataTypes.TEXT,
       defaultValue:null
     },

     receiver_info:{
       type:DataTypes.TEXT,
       defaultValue:null
     },

     company_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     creator_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     deleted_by:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     date_created:DataTypes.DATE,
     date_modified:DataTypes.DATE,
     date_deleted:DataTypes.DATE,
     date_approved:DataTypes.DATE,
     date_in:DataTypes.DATE,
     date_paid:DataTypes.DATE,

     cart:{
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
     vat:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },
     promotion_discount:{
       type:DataTypes.DECIMAL('11,2'),
       defaultValue:0
     },
     bill_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },
     bill_info:{
       type:DataTypes.TEXT,
       defaultValue:null
     },
     note:{
       type:DataTypes.TEXT,
       defaultValue:null
     }
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

    _createCode(preCode){
      return new Promise((resolve,reject)=>{

          const m = myTime.getCurent.month();

          const month = myTime.getCurent.month();
          const year = myTime.getCurent.year();
          const date = myTime.getCurent.date();

          const ticketCode = preCode; //'pc';
          const sqlOrderCode = 'code';

          const start =  year+'-'+month+'-01 00:00:00'; // '2019-02-01 00:00:00'
          const end =  year+'-'+month+'-'+date+' 23:59:00'; // '2019-02-31 23:59:00'


          model.findOne({
            where: {
              [sqlOrderCode]: {
                [Op.like]: '%'+ticketCode+'-%'
              },
              date_created:{
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

        const selWithDate = query.start !== undefined  ?  ` AND ( ${this._name}.date_created >='${query.start}' and ${this._name}.date_created <= '${query.end}'  ) `  : "";
        const selWithStatus = query.status !== undefined ? ` AND ${this._name}.status= ${query.status}  ` : '' ;
        const selWithPaymentCode = query.payment_code !== undefined ? ` AND ${this._name}.payment_code = '${query.payment_code}' ` : ''

        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} `

        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT  ${this._name}.*,
                      users.name as creator,
                      payments.type as payment_type,
                      payments.debt_num as payment_debt

                  `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id

              WHERE (${this._name}.code LIKE '%${ this._key }%')
              ${selWithDate + selWithStatus + selWithPaymentCode + selWithIsDel }
          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  LEFT JOIN payments on payments.code = ${this._name}.payment_code

                  WHERE (${this._name}.code LIKE '%${ this._key }%')

                  ${selWithDate + selWithStatus + selWithPaymentCode +selWithIsDel }

                  ORDER BY ${this._name}.${this.sort_by} ${this.sort_type}

                  ${limit}
                 `
        }

        sql += arr_type_condition[filter];
        const countSQL = ` SELECT COUNT(*) AS cnt ${ arr_type_condition['count'] } `;

        //resolve(sql);

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


    getInfoWithCode(code){

      return new Promise((resolve,reject)=>{

        const query = ` SELECT
                          ${this._name}.*,
                          users.username as user_code,
                          users.name as creator,
                          users.email as creator_email,
                          payments.type as payment_type,
                          payments.debt_num as payment_debt

                          from ${this._name}

                          LEFT JOIN users on users.id = ${this._name}.creator_id
                          LEFT JOIN payments on payments.code = ${this._name}.payment_code


                        WHERE ${this._name}.code = '${code}'
                      `;
        sequelize.query(query).spread((results, metadata) => {

          const data = results.length > 0 ? results[0] : {}
          resolve(data);

        });

      });

    },
    getInfo(id){
      return new Promise((resolve,reject)=>{

        const query = ` SELECT
                          ${this._name}.*,
                          users.name as creator,
                          payments.type as payment_type,
                          payments.debt_num as payment_debt

                          from ${this._name}

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
            where: {
              code: code,
              is_deleted:0

            },
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
