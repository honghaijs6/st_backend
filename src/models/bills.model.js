// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const myTime = require('../hooks/ultil/myTime');

const MODE = 'bills';

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

     bill_account_id:{
       type:DataTypes.INTEGER,
       defaultValue:0
     },

     code:{
      type:DataTypes.STRING,
      allowNull:true,
      defaultValue:null

     },

     ref_code:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     from_type:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     type:{
       type:DataTypes.STRING,
       allowNull:true,
       defaultValue:null
     },

     status:{
       type:DataTypes.TINYINT,
       defaultValue:0
     },

      date_created:Sequelize.DATE,
      date_modified:Sequelize.DATE,
      date_deleted:Sequelize.DATE,


     person_name:{
       type:DataTypes.STRING,
       allowNull:true,
       defaultValue:null
     },

     person_address:{
       type:DataTypes.STRING,
       allowNull:true,
       defaultValue:null
     },

     reason:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     note:{
       type:DataTypes.STRING,
       defaultValue:null
     },

     total:{
       type:DataTypes.DECIMAL('11,2'),
       defaultValue:0
     },

     total_before:{
       type:DataTypes.DECIMAL('11,2'),
       defaultValue:0
     },

     bank_ref:{
       type:DataTypes.STRING,
       allowNull:true,
       defaultValue:null
     },

     bank_ref_date:Sequelize.DATE,

     creator_id:{
       type:DataTypes.INTEGER,
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

     is_deleted:{
       type:DataTypes.TINYINT,
       defaultValue:0
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

    _type:'',
    _status:'',

    sort_by:'date_created',
    sort_type:'DESC',

    /* HTTP: GET METHOD*/

    sumaryBy(by='object',params){

      return new Promise((resolve,reject)=>{

        const {query} = params;
        const isDel = query.is_deleted || 0 ;

        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start} 00:00:00' and ${this._name}.date_created <= '${query.end} 23:59:00'  ) `  : "";
        const selWithIsDel = ` ${this._name}.is_deleted = ${isDel} ` ;
        const arrTypes = {
          "object":`
              SELECT
                 SUM(if(bills.from_type='user_code' && bills.type='pc' , bills.total ,0)) as USER_CHI,
                 SUM(if(bills.from_type='user_code' && bills.type='pt' , bills.total ,0)) as USER_THU,

                 SUM(if(bills.from_type='inv_code' && bills.type='pt' , bills.total ,0)) as CUSTOMER_THU,
                 SUM(if(bills.from_type='inv_code' && bills.type='pc' , bills.total ,0)) as CUSTOMER_CHI,

                 SUM(if(bills.from_type='po_code' && bills.type='pt' , bills.total ,0)) as SUPPLIER_THU,
                 SUM(if(bills.from_type='po_code' && bills.type='pc' , bills.total ,0)) as SUPPLIER_CHI,

                 SUM(if(bills.from_type='other_code' && bills.type='pt' , bills.total ,0)) as OTHER_THU,
                 SUM(if(bills.from_type='other_code' && bills.type='pc' , bills.total ,0)) as OTHER_CHI


              FROM bills

              WHERE  ${ selWithIsDel + selWithDate  }

          `,
          "bill_account":`
            SELECT
              bill_accounts.name as object,

              SUM(if(bills.bill_account_id= bill_accounts.id && bills.type='pc' , bills.total ,0)) as chi,
              SUM(if(bills.bill_account_id= bill_accounts.id && bills.type='pt' , bills.total ,0)) as thu

            FROM bills

            JOIN bill_accounts on bill_accounts.id = bills.bill_account_id

            WHERE  ${ selWithIsDel + selWithDate  }

            GROUP BY bill_accounts.id




          `
        }

        const sql = arrTypes[by];

        sequelize.query(sql).spread((results, metadata) => {

            const data = {
              name:'success',
              rows:results,
            }
            resolve(data);

        });

      })
    },

    listAll(filter,params){

      return new Promise((resolve,reject)=>{


        const {query} = params;

        this._maxPage = query.max || this._maxPage;
        this._page = query.p || 0   ;
        this._page = this._page * this._maxPage;

        this._key = query.key || '';
        const withKey =  ` LIKE '%${ this._key }%' `;

        this._type = query.type || '';
        this._status = query.status || '';

        this.sort_by = query.sort_by || this.sort_by;
        this.sort_type = query.sort_type || this.sort_type;

        /* ///////////////////////////////////////////////// */


        const isDel = query.is_deleted || 0 ;


        const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start} 00:00:00' and ${this._name}.date_created <= '${query.end} 23:59:00'  ) `  : "";
        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} ` ;

        const selWithType = this._type !=='' ?  ` AND  ${this._name}.type = '${this._type}' `  : "";
        const selWithAccType = query.acc_type !== undefined ?  ` AND bill_accounts.type = '${query.acc_type}' ` : ''
        

        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT ${this._name}.*,
                      users.name as creator,
                      bill_accounts.type as bill_acc_type,
                      bill_accounts.name as bill_acc_name

                    `;

        const arr_type_condition = {
          "count":`
                FROM ${this._name}
                LEFT JOIN users on users.id = ${this._name}.creator_id
                LEFT JOIN bill_accounts on bill_accounts.id = ${this._name}.bill_account_id

                WHERE (${this._name}.code ${ withKey } or ${this._name}.ref_code ${withKey} or ${this._name}.person_name ${withKey} )
                ${selWithDate + selWithType + selWithAccType + selWithIsDel  }


          `,
          "all": `

                FROM ${this._name}
                LEFT JOIN users on users.id = ${this._name}.creator_id
                LEFT JOIN bill_accounts on bill_accounts.id = ${this._name}.bill_account_id

                WHERE (${this._name}.code ${ withKey } or ${this._name}.ref_code ${withKey} or ${this._name}.person_name ${withKey} )
                ${selWithDate + selWithType + selWithAccType  + selWithIsDel  }

                ORDER BY ${this._name}.${this.sort_by} ${this.sort_type}
                ${limit}
                 `
        }

        sql += arr_type_condition[filter];
        const countSQL = ` SELECT COUNT(*) AS cnt ${ arr_type_condition['count'] } `;

        //resolve(sql)

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

    isFinishBill(inv){
       return new Promise((resolve,reject)=>{

         let ret = {
           message:'no'
         };

         model.findAll({
           where: { ref_code: inv},
           attributes: ['total','total_before']
         }).then(idata => {

           let sum = 0
           idata.map((item)=>{
             sum += parseFloat(item.total);
           });

           Object.assign(ret,{
             message: sum > 0 ? sum >= parseFloat(idata[0]['total_before']) ? 'yes':  'no' : 'no'
           })

           resolve(ret);

         });


       })
    },
    /* TẠO PHIẾU CHI - PHIÊU THU */
    _createCode(preCode){
      return new Promise((resolve,reject)=>{

          const m = myTime.getCurent.month();

          const month = myTime.getCurent.month();
          const year = myTime.getCurent.year();
          const date = myTime.getCurent.date();

          const ticketCode = preCode; //'pc';
          const sqlOrderCode = 'code'; //preCode === 'pc' ? 'code_out' : 'code';

          const start =  year+'-'+month+'-01 00:00:00'; // '2019-02-01 00:00:00'
          const end =  year+'-'+month+'-'+date+' 23:59:00'; // '2019-02-31 23:59:00'


          model.findOne({
            where: {
              [sqlOrderCode]: {
                [Op.like]: '%'+ticketCode+'-%'
              },
              date_created:{
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

        const query = ` SELECT
                          ${this._name}.*,
                          users.name as creator,
                          bill_accounts.type as bill_acc_type,
                          bill_accounts.name as bill_acc_name

                        from ${this._name}

                        LEFT JOIN users on users.id = ${this._name}.creator_id
                        LEFT JOIN bill_accounts on bill_accounts.id = ${this._name}.bill_account_id

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
