// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const myTime = require('../hooks/ultil/myTime');

const MODE = 'warehouses';
const MODE_NAME = 'Nhà Kho';

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

     is_deleted:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },

     company_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     // list [] json nhân viên làm tại đây
     user_list:{
       type:DataTypes.TEXT,
       defaultValue:null
     },
     // 	JSON list product store in here
     products_list:{
       type:DataTypes.TEXT,
       defaultValue:null
     },

     fee:{
       type:DataTypes.DECIMAL('11,2'),
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

     date_created:Sequelize.DATE,
     date_modified:Sequelize.DATE,
     date_deleted:Sequelize.DATE,

     address:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     region_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     subregion_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     phone:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     contact_person:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     json:{
       type:DataTypes.TEXT,
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
        this.sort_type = query.sort_type || this.sort_type;

        /* ///////////////////////////////////////////////// */


        const isDel = query.is_deleted || 0 ;


        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start}' and ${this._name}.date_created <= '${query.end}'  ) `  : "";
        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} ` ;

        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT ${this._name}.*, users.name as creator `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id
              WHERE (${this._name}.code LIKE '%${ this._key }%' || ${this._name}.name LIKE '%${this._key}%') ${selWithDate + selWithIsDel }

          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  WHERE (${this._name}.code LIKE '%${ this._key }%' || ${this._name}.name LIKE '%${this._key}%') ${selWithDate + selWithIsDel }
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

    getInfoWithCode(code){
      return new Promise((resolve,reject)=>{

        const query = ` SELECT ${this._name}.*,
                          users.name as creator
                          from ${this._name}
                          LEFT JOIN users on users.id = ${this._name}.creator_id
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

        const query = ` SELECT ${this._name}.*,
                          users.name as creator

                          from ${this._name}

                          LEFT JOIN users on users.id = ${this._name}.creator_id
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
