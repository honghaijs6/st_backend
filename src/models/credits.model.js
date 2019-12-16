// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const myTime = require('../hooks/ultil/myTime');

const MODE = 'credits';

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

     username:{
        type:DataTypes.STRING,
        defaultValue:null,
        allowNull:true
     },

     customer_code:{
       type:DataTypes.STRING,
       defaultValue:null,
       allowNull:true
     },
     supplier_code:{
       type:DataTypes.STRING,
       defaultValue:null,
       allowNull:true
     },

     creator_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     company_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },


     inv_code:{
       type:DataTypes.STRING,
       defaultValue:null,
       allowNull:true
     },

     isv_code:{
       type:DataTypes.STRING,
       defaultValue:null,
       allowNull:true
     },

     purchase_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     point:{
       type:DataTypes.TINYINT,
       defaultValue:1
     },

     customer_info:{
       type:DataTypes.TEXT,
       defaultValue:null
     },

     user_info:{
       type:DataTypes.TEXT,
       defaultValue:null
     },

     date_created:Sequelize.DATE,

    },
    /*{
        indexes: [
            {
                unique: true,
                fields: ['code','tax_no']
            }
        ]
    },
    {
        hooks: {
              beforeValidate: function (data, options) {
                  if (typeof data.code === 'string') {
                      data.code = data.code.toLowerCase().trim();
                  }


              }
          }
    }*/
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
        this._maxPage = query.max ||  this._maxPage ;
        this._page = query.p || 0   ;
        this._page = this._page * this._maxPage;

        this._key = query.key || '';
        const withKey = this._key === '' ? ` is null ` : ` LIKE '%${ this._key }%' `;


        const isDel = query.is_deleted || 0 ;

        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start}' and ${this._name}.date_created <= '${query.end}'  ) `  : "";
        


        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT ${this._name}.*, users.name as creator `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id
              WHERE (${this._name}.username ${withKey} or ${this._name}.customer_code ${withKey} or ${this._name}.supplier_code ${withKey} ) ${selWithDate }
          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  WHERE (${this._name}.username ${withKey} or ${this._name}.customer_code ${withKey} or ${this._name}.supplier_code ${withKey} ) ${selWithDate }
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


  });
  return model;

};
