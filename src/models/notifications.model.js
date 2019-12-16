// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const MODE = 'notifications';


module.exports = function (app) {

  // config data
  const paginate = app.get('paginate');
  const sequelize = app.get('sequelizeClient');
  const Op = sequelize.Op


  // definition database object
  const model = sequelize.define(MODE,{
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
    type:{
      type:DataTypes.STRING,
      defaultValue:null
    },
    notification_object:{
      type:DataTypes.STRING,
      defaultValue:null
    },
    notification_object_id:{
      type:DataTypes.INTEGER,
      defaultValue:0
    },
    notifier_users:{
      type:DataTypes.STRING,
      default:'root'
    },
    status:{
      type:DataTypes.TINYINT,
      defaultValue:0
    },
    date_created:Sequelize.DATE,
    date_modified:Sequelize.DATE,
    date_deleted:Sequelize.DATE,
    is_deleted:{
      type:DataTypes.TINYINT,
      defaultValue:0
    },
    deleted_by:{
      type:DataTypes.INTEGER,
      defaultValue:0
    }

  })
  Object.assign(model,{
    _name:MODE,
    _maxPage:paginate.max,
    _page:0,
    _key:'',

    _type:'',  // string :  isv_indoor || isv_outdoor
    _status:'', // number : 1: hoàn thành  0: đang thực hiện

    sort_by:'date_created',
    sort_type:'DESC',

    listAll(filter,params){

      return new Promise((resolve,reject)=>{


        const {query} = params;

        this._maxPage = query.max || this._maxPage;
        this._page = query.p || 0   ;
        this._page = this._page * this._maxPage;

        this._key = query.key || '';

        this._type = query.type || '';
        this._status = query.status || '';


        this.sort_by = query.sort_by || this.sort_by;
        this.sort_type = query.sort_type || this.sort_type;

        /* ///////////////////////////////////////////////// */


        const isDel = query.is_deleted || 0 ;


        const selWithDate = query.start !== undefined  ?  ` AND ( ${this._name}.date_created >='${query.start} 00:00:00' and ${this._name}.date_created <= '${query.end} 23:59:00'  ) `  : "";
        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} ` ;

        const selWithType = this._type !=='' ?  ` AND  ${this._name}.type = '${this._type}' `  : "";
        const selWithStatus = this._status !=='' ?  ` AND  ${this._name}.status = ${this._status} `  : "";



        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT ${this._name}.*,
                    users.username as creator_code,
                    users.name as creator

                  `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}

              LEFT JOIN users on users.id = ${this._name}.creator_id

              WHERE   ${this._name}.message LIKE '%${ this._key }%'

              ${selWithDate + selWithIsDel + selWithType + selWithStatus   }

          `,
          "all": `
                  FROM ${this._name}

                  LEFT JOIN users on users.id = ${this._name}.creator_id

                  WHERE   ${this._name}.message LIKE '%${ this._key }%'

                  ${selWithDate + selWithIsDel + selWithType + selWithStatus   }

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
    }

  });

  return model ;

};
