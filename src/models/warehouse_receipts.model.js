// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const myTime = require('../hooks/ultil/myTime');

const MODE = 'warehouse_receipts';

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

     warehouse_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },


     code_in:{
        type:DataTypes.STRING,
        allowNull:true,
        defaultValue:null

     },
     code_out:{
      type:DataTypes.STRING,
      defaultValue:null
     },

     // loại phiếu kho : in - out
     type:{
       type:DataTypes.STRING,
       defaultValue:'in'
     },

     /* TRACK_CODE
      in:[
          { code:'muahang',name:'Mua hàng'},
          {code:'nhaptra',name:'Nhập trả'},
          {code:'dieuchuyen',name:'Điểu chuyển kho'},
          {code:'canbang',name:'Cân bằng kho'},
          {code:'khac',name:'Khác'}
      ],
      out:[
          {code:'banle',name:'Bán lẻ'},
          {code:'bansi',name:'Bán sỉ'},
          {code:'xuattra',name:'Xuất trả'},
          {code:'xuatdomat',name:'Xuất do mất'},
          {code:'xuatdohu',name:'Xuất do hư'},
          {code:'dieuchuyen',name:'Điều chuyển kho'},
          {code:'canbang',name:'Cần bằng kho'},
          {code:'khac',name:'Khác'}
      ]
     */
     track_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     attack_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },
     // TRANG THÁI : 0: ĐANG XỬ LÝ - 1: FINISH
     status:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },

     customer_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     customer_info:{
       type:DataTypes.TEXT,
       defaultValue:null,
     },

     // INV
     order_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     purchase_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     supplier_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },
     supplier_info:{
       type:DataTypes.TEXT,
       defaultValue:null,
     },
     creator_id:{
       type:DataTypes.INTEGER,
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
     },

     delete_reason_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     company_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     cart:{
       type:DataTypes.TEXT,
       defaultValue:null
     },

     total:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     note:{
       type:DataTypes.STRING,
       defaultValue:null,
       allowNull:true
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

        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start} 00:00:00' and ${this._name}.date_created <= '${query.end} 23:59:00'  ) `  : "";
        const selWithType = query.type !== undefined ? ` AND ${this._name}.type='${query.type}' ` : '';
        const selWithStatus = query.status !== undefined ? ` AND ${this._name}.status = ${query.status} ` : '';

        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} `

        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT  ${this._name}.*, users.name as creator `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id
              WHERE (${this._name}.code_in LIKE '%${ this._key }%' or ${this._name}.code_out LIKE '%${ this._key }%' or ${this._name}.order_code LIKE '%${this._key}%' or ${this._name}.purchase_code LIKE '%${this._key}%' )

              ${selWithDate + selWithType + selWithStatus + selWithIsDel }

          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id
                  WHERE (${this._name}.code_in LIKE '%${ this._key }%' or ${this._name}.code_out LIKE '%${ this._key }%' or ${this._name}.order_code LIKE '%${this._key}%' or ${this._name}.purchase_code LIKE '%${this._key}%' )

                  ${selWithDate + selWithType + selWithStatus + selWithIsDel }
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
    _createCode(preCode){

      return new Promise((resolve,reject)=>{

          const m = myTime.getCurent.month();

          const month = myTime.getCurent.month();
          const year = myTime.getCurent.year();
          const date = myTime.getCurent.date();

          const ticketCode = preCode; //'inv - vk';
          const sqlOrderCode = preCode === 'do' ? 'code_out' : 'code_in';
          const sqlDateCode = 'date_created'; //preCode === 'inv' ? 'date_confirmed' : 'date_created';

          const start =  year+'-'+month+'-01 00:00:00'; // '2019-02-01 00:00:00'
          const end =  year+'-'+month+'-'+date+' 23:59:00'; // '2019-02-31 23:59:00'

          model.findOne({
            where: {
              [sqlOrderCode]: {
                [Op.like]: '%'+ticketCode+'-%'
              },
              [sqlDateCode]:{
                [Op.between]:[start,end]
              }
            },
            order:[
              [sqlOrderCode, 'DESC'],
            ],
            attributes: ['id',sqlOrderCode]
          }).then(idata => {

            let ret = {}
            let code = ticketCode+'-'+year+month+'-001';
            if(idata){

              const data = idata.dataValues ;
              let codePi = data[sqlOrderCode].substr(-3)
              let n = parseInt(codePi) + 1;

              if(n<10){
                  n = '00'+n;
              }else if(n>=10 && n<100){
                  n = '0'+n;
              }

              code = ticketCode+'-'+year+month+'-'+n;


            }
            resolve(code);
          });

      })
    },

    getInfo(id){
      return new Promise((resolve,reject)=>{

        const query = ` SELECT  ${this._name}.*,
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
