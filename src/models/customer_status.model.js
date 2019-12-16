// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

//const myTime = require('../hooks/ultil/myTime');


const MODE = 'customer_status';

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

     name:{
       type:DataTypes.STRING,
       defaultValue:null

     },

     decription:{
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

     deleted_by:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     is_deleted:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },


      date_created:Sequelize.DATE,
      date_modified:Sequelize.DATE,
      date_deleted:Sequelize.DATE,

      color_code:{
        type:DataTypes.STRING,
        defaultValue:0
      },

     json:{
       type:DataTypes.TEXT,
       defaultValue:null
     },

    },
    {
        hooks: {
              beforeValidate: function (data, options) {
                  if (typeof data.code === 'string') {
                      data.code = data.code.toLowerCase().trim();
                  }


              }
          }
    },

  );

  Object.assign(model,{

    _name:MODE,

    _maxPage:paginate.max,
    _page:0,
    _key:'',
    _start:'',
    _end:'',

    _type:'',
    _status:'',
    _method:'',

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

        this._start = query.start || this._start;
        this._end = query.end || this._end;

        this._type = query.type || this._type;
        this._status = query.status || this._status;
        this._method = query.method || this._method;



        this.sort_by = query.sort_by || this.sort_by;
        this.sort_type = query.sort_type || this.sort_type;

        /* ///////////////////////////////////////////////// */


        const isDel = query.is_deleted || 0 ;


        const selWithDate = this._start !=='' ?  ` AND ( ${this._name}.date_created >='${this._start}' and ${this._name}.date_created <= '${this._end}'  ) `  : "";
        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} ` ;


        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT  ${this._name}.*, count(distinct customers.id) as total_customer, users.name as creator `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id
              WHERE (${this._name}.json LIKE '%${ this._key }%' OR ${this._name}.code LIKE '%${this._key}%')  ${selWithDate + selWithIsDel    }
          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  LEFT JOIN customers on  customers.status_code = ${this._name}.code
                  WHERE (${this._name}.json LIKE '%${ this._key }%' OR ${this._name}.code LIKE '%${this._key}%')  ${selWithDate + selWithIsDel    }

                  GROUP BY ${this._name}.id

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
