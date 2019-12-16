// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const MODE = 'bill_accounts';

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

     //TM - CK - Voucher - Point - Credit - COD
     type:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     name:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null
     },

     bank_no:{
       type:DataTypes.STRING,
       defaultValue:null
     },
     bank_name:{
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

     date_created: DataTypes.DATE,
     date_modified:DataTypes.DATE,
     date_deleted:DataTypes.DATE,



     is_deleted:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },

     note:{
       type:DataTypes.STRING,
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


    listAll(filter,params){

      return new Promise((resolve,reject)=>{


        const {query} = params;
        this._maxPage = query.max ||  this._maxPage ;
        this._page = query.p || 0   ;
        this._page = this._page * this._maxPage;

        this._key = query.key || '';
        const withKey =  ` LIKE '%${ this._key }%' `;


        const isDel = query.is_deleted || 0 ;


        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start}' and ${this._name}.date_created <= '${query.end}'  ) `  : "";
        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} `

        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT  ${this._name}.*, users.name as creator `;

        const arr_type_condition = {

          "count":`
            FROM ${this._name}
            LEFT JOIN users on users.id = ${this._name}.creator_id
            WHERE (${this._name}.name ${withKey} ) ${selWithDate + selWithIsDel }

          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  WHERE (${this._name}.name  ${withKey} ) ${selWithDate + selWithIsDel }
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

              resolve(data);
          })


        });


      })
    },


    getInfo(id){
      return new Promise((resolve,reject)=>{

        const query = ` SELECT   ${this._name}.*,
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
