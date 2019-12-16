// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const myTime = require('../hooks/ultil/myTime');

const MODE = 'user_roles';

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

     role_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     user_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     group_user_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },
     creator_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     company_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     date_created:Sequelize.DATE,
     date_modified:Sequelize.DATE

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
        const selWithGroupID = query.group_user_id !== undefined ? ` AND user_roles.group_user_id = ${query.group_user_id} ` : ``;

        let sql = ` SELECT
                        user_roles.id,
                        user_roles.id,

                        roles.id as role_id, roles.code as role_code, roles.name as role_name


                  `;

        const arr_type_condition = {

          "count":`
            FROM ${this._name}

            LEFT JOIN users on users.id = ${this._name}.creator_id
            LEFT JOIN roles on (roles.id = user_roles.role_id)
            LEFT JOIN group_users on (group_users.id = user_roles.group_user_id)

            WHERE group_users.staff_on LIKE '%${this._key}%' ${ selWithGroupID }


          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  LEFT JOIN roles on (roles.id = user_roles.role_id)
                  LEFT JOIN group_users on (group_users.id = user_roles.group_user_id)

                  WHERE group_users.staff_on LIKE '%${this._key}%' ${ selWithGroupID }

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
