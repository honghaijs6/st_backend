// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;


const MODE = 'offices';

module.exports = function (app) {

  // config Database
  const paginate = app.get('paginate');
  const sequelize = app.get('sequelizeClient');

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

     name:{
        type:DataTypes.STRING,
        defaultValue:null
     },
     type:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:'main'   /* enum [main,sub] : kiểu văn phòng : chính - phụ*/
     },
     is_deleted:{
       type:DataTypes.TINYINT,
       defaultValue:0
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

     leader_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     staff_on:{
       type:DataTypes.TEXT,
       allowNull:true,
       defaultValue:null

     },

     date_created:Sequelize.DATE,
     date_modified:Sequelize.DATE,
     date_deleted:Sequelize.DATE,

     working_begin:{
       type:DataTypes.TIME,
       allowNull:true
     },
     working_end:{
       type:DataTypes.TIME,
       allowNull:true
     },

     address:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     region_code:{
       type:DataTypes.STRING,
       defaultValue:null,
       allowNull:true
     },
     subregion_code:{
       type:DataTypes.STRING,
       defaultValue:null,
       allowNull:true
     },

     ip_chamcong:{
       type:DataTypes.STRING,
       defaultValue:null,
       allowNull:true
     },

     lat:{
       type:DataTypes.FLOAT('15,2'),
       defaultValue:0
     },
     lng:{
       type:DataTypes.FLOAT('15,2'),
       defaultValue:0
     },



    phone:{
      type:DataTypes.STRING,
      defaultValue:null,

    },
    email:{
      type:DataTypes.STRING,
      allowNull:true,
    },
    fax:{
      type:DataTypes.STRING,
      allowNull:true
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

    _name:MODE,

    _maxPage:paginate.max,
    _page:0,
    _key:'',

    _type:'', // STRING : main || sub offices


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

        this._type = query.type || this._type;



        this.sort_by = query.sort_by || this.sort_by;
        this.sort_type = query.sort_type || this.sort_type;

        /* ///////////////////////////////////////////////// */


        const isDel = query.is_deleted || 0 ;


        const selWithDate = query.start !== undefined  ?  ` AND ( ${this._name}.date_created >='${query.start}' and ${this._name}.date_created <= '${query.end}'  ) `  : "";
        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} ` ;

        const selWithType = this._type !=='' ? ` AND ${this._name}.type='${this._type}' ` : "";



        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT
                      ${this._name}.*,
                      regions.name as city,
                      count(distinct users.id) as total_user

        `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}

              LEFT JOIN users on users.office_id = ${this._name}.id

              WHERE (
                      ${this._name}.name LIKE '%${ this._key }%' OR

                      ${this._name}.staff_on LIKE '%${this._key}%'
                    )

              ${selWithDate + selWithIsDel + selWithType }

          `,
          "all": `
                  FROM ${this._name}

                  LEFT JOIN users on users.office_id = ${this._name}.id

                  LEFT JOIN regions on regions.code = offices.region_code

                  WHERE (
                          ${this._name}.name LIKE '%${ this._key }%' OR

                          ${this._name}.staff_on LIKE '%${this._key}%'
                        )

                  ${selWithDate + selWithIsDel + selWithType  }

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

        const query = ` SELECT  ${this._name}.*,

                          regions.name as city,
                          count(distinct users.id) as total_user

                        FROM  ${this._name}

                        LEFT JOIN users on users.office_id = ${this._name}.id
                        LEFT JOIN regions on regions.code = offices.region_code

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
