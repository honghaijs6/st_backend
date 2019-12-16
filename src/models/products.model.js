// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const MODE ='products';
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
    supplier_codes:{
       type:DataTypes.STRING,
       allowNull:true,
       defaultValue:null
    },

    categories_id:{
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
    deleted_by:{
      type:DataTypes.INTEGER,
      defaultValue:0
    },
    name:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null
     },
     unit:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },
     is_serial:{
       type:DataTypes.TINYINT,
       defaultValue:1
     },
     // TYPE :	main - sub - service - project - software
     type:{
       type:DataTypes.STRING,
       defaultValue:'root'
     },

     price_1:{
       type:DataTypes.DECIMAL('11,2'),
       defaultValue:0
     },
     price_2:{
       type:DataTypes.DECIMAL('11,2'),
       defaultValue:0
     },
     price_3:{
       type:DataTypes.DECIMAL('11,2'),
       defaultValue:0
     },
     price_4:{
       type:DataTypes.DECIMAL('11,2'),
       defaultValue:0
     },
     total_available:{  // soluong co san trong kho
       type:DataTypes.INTEGER,
       defaultValue:0
     },
     total_received:{ // số lượng sẽ nhập kho
       type:DataTypes.INTEGER,
       defaultValue:0
     },
     total_shiped:{ // Số lượng sẽ xuất kho
       type:DataTypes.INTEGER,
       defaultValue:0
     },
     total_onhand:{ // Số lượng ước tính cuối cùng
       type:DataTypes.INTEGER,
       defaultValue:0
     },
     images:{
       type:DataTypes.STRING,
       allowNull:true,
       defaultValue:null
     },
     content:{
       type:DataTypes.TEXT,
       allowNull:true,
       defaultValue:null
     },

     follow_list:{
       type:DataTypes.TEXT,
       defaultValue:null
     },

     software_list:{
       type:DataTypes.TEXT,
       allowNull:true,
       defaultValue:null
     },
     subpro_list:{
       type:DataTypes.TEXT,
       allowNull:true,
       defaultValue:null
     },
     date_created:Sequelize.DATE,
     date_modified:Sequelize.DATE,
     date_deleted:Sequelize.DATE,

     is_deleted:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },
     guran_month:{
       type:DataTypes.TINYINT,
       defaultValue:6
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

    sort_by:'date_created',
    sort_type:'DESC',

    /* HTTP: GET METHOD*/

    /* HTTP: GET METHOD*/
    listAll(filter,params){

      return new Promise((resolve,reject)=>{


        const {query} = params;

        this._maxPage = query.max || this._maxPage;
        this._page = query.p || 0   ;
        this._page = this._page * this._maxPage;

        this._key = query.key || '';
        const withKey = ` LIKE '%${this._key}%' `

        this.sort_by = query.sort_by || this.sort_by;
        this.sort_type = query.sort_type || this.sort_type;

        /* ///////////////////////////////////////////////// */

        const isDel = query.is_deleted || 0 ;


        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start}' and ${this._name}.date_created <= '${query.end}'  ) `  : "";
        const selWithCateId = query.categories_id !== undefined ? ` AND ${this._name}.categories_id = ${query.categories_id}  ` : '';
        const selWithType = query.type !== undefined ? ` AND ${this._name}.type = '${query.type}' ` : ''

        const selWithSupCode = query.supplier_codes !== undefined ? query.supplier_codes !== '' ? ` AND ${this._name}.supplier_codes = '${query.supplier_codes}' ` : '' : '';

        const selWithFollowList = query.follow_list !== undefined ? ` AND ${this._name}.follow_list LIKE '%${query.follow_list}%' ` : '';

        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} ` ;



        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT

                    ${this._name}.id,
                    ${this._name}.supplier_codes,
                    ${this._name}.categories_id,
                    ${this._name}.code,
                    ${this._name}.name,
                    ${this._name}.unit,
                    units.name as unit_name,
                    ${this._name}.is_serial,
                    ${this._name}.type,
                    ${this._name}.price_1,
                    ${this._name}.price_2,
                    ${this._name}.price_3,
                    ${this._name}.price_4,

                    ${this._name}.total_available,
                    ${this._name}.total_received,
                    ${this._name}.total_shiped,
                    ${this._name}.total_onhand,

                    ${this._name}.images,
                    ${this._name}.follow_list,

                    ${this._name}.date_created,
                    ${this._name}.date_modified,
                    ${this._name}.date_deleted,

                    ${this._name}.guran_month,
                    ${this._name}.content,
                    ${this._name}.is_deleted,

                    categories.name as category,
                    users.name as creator

                  `;
        if(filter==='inventory'){
          sql += `
              ,
              SUM(if(product_logs.type='in', product_logs.balance ,0)) as NHAP,
              SUM(if(product_logs.type='out', product_logs.balance ,0)) as XUAT,
              (SELECT count(serials.id) FROM serials WHERE products.code = serials.product_code) as SERIAL_NUM
          `;

        }

        const arr_type_condition = {
          "count":`
              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id
              LEFT JOIN categories on categories.id = ${this._name}.categories_id
              LEFT JOIN units on units.id = ${this._name}.unit

              WHERE (${this._name}.name ${withKey} or ${this._name}.code ${withKey} )
              ${selWithDate + selWithCateId + selWithType + selWithSupCode + selWithFollowList + selWithIsDel }

          `,
          "inventory":`
              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id
              LEFT JOIN categories on categories.id = ${this._name}.categories_id
              LEFT JOIN units on units.id = ${this._name}.unit

              LEFT JOIN product_logs on product_logs.product_code = products.code


              WHERE (${this._name}.name LIKE '%${ this._key }%' or ${this._name}.code LIKE '%${ this._key }%' )
              ${selWithDate + selWithCateId + selWithType + selWithSupCode + selWithFollowList + selWithIsDel }

              GROUP BY ${this._name}.id

              ORDER BY ${this._name}.${this.sort_by} ${this.sort_type}
              ${limit}
          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  LEFT JOIN categories on categories.id = ${this._name}.categories_id
                  LEFT JOIN units on units.id = ${this._name}.unit




                  WHERE (${this._name}.name LIKE '%${ this._key }%' or ${this._name}.code LIKE '%${ this._key }%' )
                  ${selWithDate + selWithCateId + selWithType + selWithSupCode + selWithFollowList + selWithIsDel }

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

        const query = ` SELECT ${this._name}.*,

                          categories.name as category,
                          users.name as creator

                        FROM ${this._name}

                        LEFT JOIN users on users.id = ${this._name}.creator_id
                        LEFT JOIN categories on categories.id = ${this._name}.categories_id

                        WHERE ${this._name}.id = ${id}
                      `;
        sequelize.query(query).spread((results, metadata) => {

          const data = results.length > 0 ? results[0] : {}
          resolve(data);

        });

      });
    },

    // cURL : http://localhost:3333/products/checkcode?code=xxx
    isExisted(code='no-code'){
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
