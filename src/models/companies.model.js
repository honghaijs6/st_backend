// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const MODE = 'companies' ;

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
     bussiness_type:{
       type:DataTypes.TINYINT,
       defaultValue:1
     },
     /* 1 : loại hình bán hàng : 2 ngành kinh doanh */

     name:{
        type:DataTypes.STRING,
        defaultValue:null

     },
     tax_no:{
       type:DataTypes.STRING,
       allowNull:true,
       defaultValue:null
     },
     status:{
       type:DataTypes.TINYINT,
       defaultValue:1      // [1: aenable - 0: disable ]
     },
     is_deleted:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },
     logo:{
       type:DataTypes.STRING,
       allowNull:true,
       defaultValue:null
     },

     date_created:DataTypes.DATE,
     date_modified:DataTypes.DATE,
     date_deleted:DataTypes.DATE,

     creator_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     deleted_by:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },


     lat:{
       type:DataTypes.FLOAT,
       defaultValue:0
     },
     lng:{
       type:DataTypes.FLOAT,
       defaultValue:0
     },

    address:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null

    },
    region_code:{
      type:DataTypes.STRING,
      defaultValue:79, // TP HO CHI MINH
    },
    subregion_code:{
      type:DataTypes.STRING,
      defaultValue:760 // 760 : QUAN 1
    },
    phone:{
      type:DataTypes.STRING,
      allowNull:true,
      defaultValue:null
    },
    email:{
      type:DataTypes.STRING,
      allowNull:true,
      set(val){
        this.setDataValue('email',val.toLowerCase())
      }
    },
    fax:{
      type:DataTypes.STRING,
      allowNull:true
    },
    website:{
      type:DataTypes.STRING,
      allowNull:true,
      defaultValue:null
    },
    cloudtags:{
      type:DataTypes.STRING,
      allowNull:true,
      defaultValue:null
    },
    config:{
        type:DataTypes.TEXT('tiny'),
        allowNull:true,
        defaultValue: null
    },

    point_formula:{
      type:DataTypes.TEXT('tiny'),
      allowNull:true,
      defaultValue:null
    },

    warehouse_setting:{
      type:DataTypes.TEXT,
      defaultValue:null
    },
    notification_setting:{
      type:DataTypes.TEXT,
      defaultValue:null
    },
    server_setting:{
      type:DataTypes.TEXT,
      defaultValue:null
    },

    price_setting:{
      type:DataTypes.TEXT,
      defaultValue:null
    },
    quotation_temp:{
      type:DataTypes.TEXT,
      defaultValue:null
    },
    order_temp:{
      type:DataTypes.TEXT,
      defaultValue:null
    },
    receipt_out_temp:{
      type:DataTypes.TEXT,
      defaultValue:null
    },
    receipt_in_temp:{
      type:DataTypes.TEXT,
      defaultValue:null
    },
    phieuthu_temp:{
      type:DataTypes.TEXT,
      defaultValue:null
    },
    phieuchi_temp:{
      type:DataTypes.TEXT,
      defaultValue:null
    },
    iservice_temp:{
      type:DataTypes.TEXT,
      defaultValue:null
    }

  }

  )


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

        this._key = query.key || '' ;
        const withKey =  ` LIKE '%${ this._key }%' `;


        const isDel = query.is_deleted || 0 ;


        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start}' and ${this._name}.date_created <= '${query.end}'  ) `  : "";
        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} `

        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT
                        ${this._name}.id,
                        ${this._name}.bussiness_type,
                        ${this._name}.name,
                        ${this._name}.tax_no,
                        ${this._name}.status,
                        ${this._name}.is_deleted,
                        ${this._name}.logo,
                        ${this._name}.date_created,
                        ${this._name}.date_modified,
                        ${this._name}.date_deleted,
                        ${this._name}.creator_id,
                        ${this._name}.deleted_by,
                        ${this._name}.address,
                        ${this._name}.region_code,
                        ${this._name}.subregion_code,
                        ${this._name}.phone,
                        ${this._name}.email,
                        ${this._name}.fax,
                        ${this._name}.website,
                        ${this._name}.cloudtags,

                        users.name as creator `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id
              WHERE (${this._name}.name ${withKey} or ${this._name}.tax_no  ${withKey} ) ${selWithDate + selWithIsDel }
          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  WHERE (${this._name}.name ${withKey} or ${this._name}.tax_no  ${withKey} ) ${selWithDate + selWithIsDel }
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
