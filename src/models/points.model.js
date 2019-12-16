// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const myTime = require('../hooks/ultil/myTime');

const MODE = 'points';

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
     type:{
       type:DataTypes.TINYINT,
       defaultValue:1
     },
     creator_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },
     company_id:{
       type:DataTypes.INTEGER
     },
     customer_code:{
       type:DataTypes.STRING,
       defaultValue:null,
       allowNull:true
     },
     inv_code:{
       type:DataTypes.STRING,
       defaultValue:null,
       allowNull:true
     },
     operation:{
       type:DataTypes.STRING,
       defaultValue:'+'
     },
     point:{
       type:DataTypes.TINYINT,
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
        this._maxPage = query.max ||  this._maxPage ;
        this._page = query.p || 0   ;
        this._page = this._page * this._maxPage;

        this._key = query.key || this._key;


        const isDel = query.is_deleted || 0 ;

        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start}' and ${this._name}.date_created <= '${query.end}'  ) `  : "";
        const selWithType = query.type !== undefined ? ` AND ${this._name}.type = ${query.type} ` : '';

        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT  ${this._name}.*, users.name as creator, customers.name as customer_name `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id
              LEFT JOIN customers on customers.code = ${this._name}.customer_code
              WHERE (${this._name}.customer_code LIKE '%${ this._key }%' or ${this._name}.inv_code LIKE '%${ this._key }%' ) ${selWithDate } ${selWithType}
          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  LEFT JOIN customers on customers.code = ${this._name}.customer_code

                  WHERE (${this._name}.customer_code LIKE '%${ this._key }%' or ${this._name}.inv_code LIKE '%${ this._key }%' ) ${selWithDate } ${selWithType}
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
