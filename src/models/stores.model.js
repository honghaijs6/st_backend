// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const MODE = 'stores';

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
     code:{
       type:DataTypes.STRING,
       allowNull:true,
       defaultValue:null

     },


     name:{
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
          notEmpty:{
            args:true,
            msg:"Vui lòng nhập tên"
          },
          len: {
            args:[4,120],
            msg:'Tên bộ phận giới hạn trong khoảng [4,120] ký tự'
          },


        }
     },

     type:{
       type:DataTypes.TINYINT,
       defaultValue:1
     },

     // AVAILABLE - NOT
     status:{
       type:DataTypes.TINYINT,
       defaultValue:1
     },

     is_deleted:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },

     company_id:{
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

    ip_chamcong:{
      type:DataTypes.STRING,
      defaultValue:null
    },

    phone:{
      type:DataTypes.STRING,
      defaultValue:null
    },

    email:{
      type:DataTypes.STRING,
      defaultValue:null
    },

    fax:{
      type:DataTypes.STRING,
      defaultValue:null
    },

    lat:{
      type:DataTypes.FLOAT('15,2'),
      defaultValue:0
    },
    lng:{
      type:DataTypes.FLOAT('15,2'),
      defaultValue:0
    },

    setting:{
      type:DataTypes.TEXT,
      allowNull:true,
      defaultValue:null
    },

    json:{
      type:DataTypes.TEXT,
      allowNull:true,
      defaultValue:null
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
  )


  Object.assign(model,{

    _name:'departments',

    _maxPage:paginate.max,
    _page:0,
    _key:'',
    _start:'',
    _end:'',

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
        this._start = query.start || this._start;
        this._end = query.end || this._end;

        const isDel = query.is_deleted || 0 ;


        const selWithDate = this._start !=='' ?  ` AND ( ${this._name}.date_created >='${this._start}' and ${this._name}.date_created <= '${this._end}'  ) `  : "";
        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} `

        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT ${this._name}.*, users.name as creator `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}
              INNER JOIN users on users.id = ${this._name}.creator_id
              WHERE (${this._name}.json LIKE '%${ this._key }%' or ${this._name}.code LIKE '%${this._key}%' ) ${selWithDate + selWithIsDel }
          `,
          "all": `
                  FROM ${this._name}
                  INNER JOIN users on users.id = ${this._name}.creator_id
                  WHERE (${this._name}.json LIKE '%${ this._key }%' or ${this._name}.code LIKE '%${this._key}%' ) ${selWithDate + selWithIsDel }
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
    // cURL : http://localhost:3333/products/checkcode?code=xxx
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
