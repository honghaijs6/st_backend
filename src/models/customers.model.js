// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const myTime = require('../hooks/ultil/myTime');

const MODE = 'customers';

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

     level_id:{
      type:DataTypes.INTEGER,
      defaultValue:0
     },


      type:{
        type:DataTypes.STRING,
        defaultValue:"find_dl"
      },
      status_code:{
        type:DataTypes.STRING,
        defaultValue:null
      },

      original_code:{
        type:DataTypes.STRING,
        defaultValue:null
      },

      buyer:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null
      },

      name:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null
      },



      total_point:{
        type:DataTypes.TINYINT,
        defaultValue:0
      },

      region_code:{
        type:DataTypes.STRING,
        defaultValue:null
      },


      subregion_code:{
        type:DataTypes.STRING,
        defaultValue:null
      },


      address:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null
      },

      address_delivery:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null
      },

      address_xhd:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null
      },


      tax_no:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null
      },

      contact_name:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null
      },

      phone:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null
      },
      email:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null
      },

      status:{ // trang thái khoá
        type:DataTypes.TINYINT,
        defaultValue:1
      },

      creator_id:{
        type:DataTypes.INTEGER,
        defaultValue:0
      },

      belong_user:{
        type:DataTypes.STRING,
        defaultValue:'system'
      },
      company_id:{
        type:DataTypes.INTEGER,
        defaultValue:0
      },


      date_created:Sequelize.DATE,
      date_modified:Sequelize.DATE,
      date_deleted:Sequelize.DATE,


      json:{
        type:DataTypes.TEXT,
        defaultValue:null
      },

      note:{
        type:DataTypes.TEXT,
        defaultValue:null
      },

      is_deleted:{
         type:DataTypes.TINYINT,
         defaultValue:0
      }

  },

  {
        hooks: {
              beforeValidate: function (data, options) {
                  if (typeof data.code === 'string') {
                      data.code = data.code.toLowerCase().trim();
                  }


              }
          }
  }
);

  Object.assign(model,{

    _name:'customers',

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

        const selWithDate = query.start !==undefined ?  ` AND ( ${this._name}.date_created >='${query.start}' and ${this._name}.date_created <= '${query.end}'  ) `  : "";
        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} ` ;

        const selWithType = query.type !== undefined ?  ` AND  ${this._name}.type = '${query.type}' `  : "";
        const selWithStatus = query.status !== undefined ?  ` AND  ${this._name}.status = ${query.status} `  : "";
        const selWithStatusCode = query.status_code !== undefined ?  ` AND  ${this._name}.status_code = '${query.status_code}' `  : "";
        const selWithLevel = query.level_id !== undefined  ?  ` AND  ${this._name}.level_id = '${query.level_id}' `  : "";

        const selWithOriginalCode = query.original_code !== undefined ? ` AND ${this._name}.original_code = '${query.original_code}' ` : "";


        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT
                      ${this._name}.id,
                      ${this._name}.code,
                      ${this._name}.level_id,
                      ${this._name}.type,
                      ${this._name}.status_code,
                      ${this._name}.original_code,
                      ${this._name}.buyer,
                      ${this._name}.name,
                      ${this._name}.total_point,
                      ${this._name}.region_code,
                      ${this._name}.subregion_code,
                      ${this._name}.address,
                      ${this._name}.address_delivery,
                      ${this._name}.address_xhd,
                      ${this._name}.tax_no,
                      ${this._name}.contact_name,
                      ${this._name}.phone,
                      ${this._name}.email,
                      ${this._name}.status,
                      ${this._name}.creator_id,
                      ${this._name}.belong_user,
                      ${this._name}.company_id,
                      ${this._name}.deleted_by  ,
                      ${this._name}.date_created,
                      ${this._name}.date_modified,
                      ${this._name}.date_deleted,
                                        
                      users.name as creator,
                      regions.name as city,
                      customer_types.name as type_name,
                      customer_types.ref_price as ref_price,
                      customer_types.color_code,
                      customer_status.name as customer_status,
                      customer_originals.name as customer_original,
                      levels.code as level_code,
                      levels.name as level_name,
                      levels.benefit_discount as benefit_discount,
                      levels.active_on as discount_for
          `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id
              WHERE (${this._name}.json LIKE '%${ this._key }%' OR ${this._name}.code LIKE '%${this._key}%')
              ${selWithDate + selWithIsDel + selWithType + selWithStatus + selWithLevel + selWithStatusCode + selWithOriginalCode }
          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  LEFT JOIN customer_types on customer_types.code = ${this._name}.type
                  LEFT JOIN customer_status on customer_status.code = ${this._name}.status_code
                  LEFT JOIN customer_originals on customer_originals.code = ${this._name}.original_code
                  LEFT JOIN levels on levels.id = ${this._name}.level_id

                  LEFT JOIN regions on regions.code = ${this._name}.region_code

                  WHERE (${this._name}.json LIKE '%${ this._key }%' OR ${this._name}.code LIKE '%${this._key}%')
                  ${selWithDate + selWithIsDel + selWithType + selWithStatus + selWithLevel + selWithStatusCode + selWithOriginalCode }
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

        let sql = ` SELECT ${this._name}.*,
                      users.name as creator,
                      customer_types.name as type_name,
                      customer_types.color_code,
                      customer_status.name as customer_status,
                      customer_originals.name as customer_original,
                      levels.code as level_code,
                      levels.name as level_name,
                      levels.benefit_discount as benefit_discount,
                      levels.active_on as discount_for

                      FROM ${this._name}

                      LEFT JOIN users on users.id = ${this._name}.creator_id
                      LEFT JOIN customer_types on customer_types.code = ${this._name}.type
                      LEFT JOIN customer_status on customer_status.code = ${this._name}.status_code
                      LEFT JOIN customer_originals on customer_originals.code = ${this._name}.original_code
                      LEFT JOIN levels on levels.id = ${this._name}.level_id

                      WHERE ${this._name}.id = ${id}
          `;

        sequelize.query(sql).spread((results, metadata) => {

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
