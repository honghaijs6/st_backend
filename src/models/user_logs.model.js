// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const myTime = require('../hooks/ultil/myTime');

const MODE = 'user_logs';

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

     creator_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     company_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     model_action:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     date_created:Sequelize.DATE,

    },

  );

  Object.assign(model,{

    _name:MODE,

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

        this._maxPage = query.max || this._maxPage;
        this._page = query.p || 0   ;
        this._page = this._page * this._maxPage;

        this._key = query.key || '';

        this._start = query.start || this._start;
        this._end = query.end || this._end;

        this.sort_by = query.sort_by || this.sort_by;
        this.sort_type = query.sort_type || this.sort_type;

        /* ///////////////////////////////////////////////// */


        const isDel = query.is_deleted || 0 ;


        const selWithDate = this._start !=='' ?  ` WHERE  ( ${this._name}.date_created >='${this._start}' and ${this._name}.date_created <= '${this._end}'  ) `  : "";
        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} `

        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT  ${this._name}.*, users.name as creator `;

        const arr_type_condition = {

          "count":`
            FROM ${this._name}
            LEFT JOIN users on users.id = ${this._name}.creator_id
            ${selWithDate  }
          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  ${selWithDate  }
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


  });

  return model;

};
