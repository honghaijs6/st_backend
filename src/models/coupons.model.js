// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const moment = require('moment');
const myTime = require('../hooks/ultil/myTime');


const MODE = 'coupons';


module.exports = function (app) {

  // config Database
  const paginate = app.get('paginate');
  const sequelize = app.get('sequelizeClient');
  const Op = sequelize.Op

  const model = sequelize.define(MODE,{
    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true,
      unique:true
    },

    code:{
      type:DataTypes.STRING,
      defaultValue:null
    },
    status:{
      type:DataTypes.TINYINT,
      defaultValue:1
    },
    value:{
      type:DataTypes.INTEGER,
      defaultValue:0
    },
    value_type:{
      type:DataTypes.TINYINT,
      defaultValue:0  //  0 : phan tram - 1 gia tri
    },
    number_offer:{
      type:DataTypes.INTEGER,
      defaultValue:1
    },

    used_count:{
      type:DataTypes.INTEGER,
      defaultValue:0
    },

    implements:{
      type:DataTypes.TEXT,
      defaultValue:null
    },
    date_begin:{
      type:DataTypes.DATE,
      defaultValue:null
    },
    date_finish:{
      type:DataTypes.DATE,
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
    date_created:DataTypes.DATE,
    date_modified:DataTypes.DATE,
    date_deleted:DataTypes.DATE,
    is_deleted:{
      type:DataTypes.TINYINT,
      defaultValue:0
    }
  })


  const Coupon = Object.assign(model,{

    _name:MODE,

    _maxPage:paginate.max,
    _page:0,
    _key:'',
    _start:'',
    _end:'',

    sort_by:'date_created',
    sort_type:'DESC',

    retData :{
      name:'success',
      data:{},
      message:''
    },

    isExisted(code){
        return new Promise((resolve,reject)=>{

           model.findOne({
             where: { code:code },
             attributes: ['id']
           }).then(idata => {

             const data = idata || {};

             resolve( Object.assign(this.retData,{
               message:JSON.stringify(data)==="{}" ? "no" : "yes"
             }));

           }).catch((err) => { reject(err) })

        })
    },


    // DEFAULT NONE
    async _createCode(preCode=''){


      return new Promise((resolve,reject)=>{




          const month = myTime.getCurent.month();
          const year = myTime.getCurent.year().toString().substr(2,2) ;

          let code = year+month+'000001';

          model.findOne({
            order:[
              ['date_created', 'DESC'],
            ],
            attributes: ['id','code']
          }).then(idata => {


            if(idata){


              let codePi = idata['code'].substr(-6);
              let n = parseInt(codePi) + 1

              if(n<10){
                n = '00000'+n ;
              }else if(n>=10 && n<100){
                n = '0000'+n;
              }else if(n>=100 && n<1000){
                n = '000'+n
              }else if(n>=1000 && n<10000){
                n = '00'+n
              }else if(n>=10000 && n < 100000){
                n = '0'+n ;
              }

              code = year+month+n;

            }

            resolve(code);

          });


      })
    },


    async isAvailable(code){

      const resInfo = await this.getInfoByCode(code);
      if(resInfo.name==='success'){

          if(JSON.stringify(resInfo.data)!='{}'){
            const info = resInfo.data ;
            const date_begin = moment(info['date_begin']).format('YYYY-MM-DD')+' 00:00:00';
            const date_finish = moment(info['date_finish']).format('YYYY-MM-DD')+' 23:59:00';

            return new Promise((resolve,reject)=>{

              const strQuery = `
                SELECT ${this._name}.*
                FROM  ${this._name}
                WHERE
                  ${this._name}.code = '${code}' AND ${this._name}.date_created between '${ date_begin }' and '${ date_finish }'
              `;

              sequelize.query(strQuery).spread((results,metadata)=>{
                  //return results;
                  resolve(
                    Object.assign(this.retData,{
                      message: results.length > 0 ? 'yes':'no',
                      data:results.length > 0 ? results[0]:{}
                    })
                  );


              }).catch((err) => { reject(err) })

            });

          }else{
            return Object.assign(this.retData,{
              name:'success',
              message:'no'
            });

          }

      }else{
        // ERROR
        return resInfo;
      }


    },



    getInfoByCode(code){
      return new Promise((resolve,reject)=>{
          const strQuery = ` SELECT
                          ${this._name}.*,
                          users.name as creator, users.photoURL as creator_avatar
                          from ${this._name}
                          LEFT JOIN users on users.id = ${this._name}.creator_id

                        WHERE ${this._name}.code = '${code}'
                      `;

          sequelize.query(strQuery).spread((results,metadata)=>{

            const ret = {
              name:'success',
              data: results.length > 0 ? results[0] : {}
            }
            resolve(ret);

          }).catch((err) => {
            reject(err);
          })

      })
    },




    getInfo(id){
      return new Promise((resolve,reject)=>{
          const query = ` SELECT
                            ${this._name}.*,

                            users.name as creator, users.photoURL as creator_avatar
                            from ${this._name}
                            LEFT JOIN users on users.id = ${this._name}.creator_id


                          WHERE ${this._name}.id = ${id}

                          GROUP BY ${this._name}.id
                        `;
          sequelize.query(query).spread((results, metadata) => {

            const data = results.length > 0 ? results[0] : {}
            resolve(data);

          });
      })
    },


    listAll(filter,params){

      return new Promise((resolve,reject)=>{


        const {query} = params;
        this._maxPage = query.max ||  this._maxPage ;
        this._page = query.p || 0   ;
        this._page = this._page * this._maxPage;

        this._key = query.key || '';
        this._start = query.start || this._start;
        this._end = query.end || this._end;

        const isDel = query.is_deleted || 0 ;


        const selWithDate = this._start !=='' ?  ` AND ( ${this._name}.date_created >='${this._start} 00:00:00' and ${this._name}.date_created <= '${this._end} 23:59:00'  ) `  : "";
        const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} ` ;



        const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

        let sql = ` SELECT
                          ${this._name}.*,

                          users.name as creator, users.photoURL as creator_avatar `;

        const arr_type_condition = {

          "count":`
              FROM ${this._name}
              LEFT JOIN users on users.id = ${this._name}.creator_id
              WHERE (
                    ${this._name}.code LIKE '%${ this._key }%'
              )
              ${selWithDate + selWithIsDel }
          `,
          "all": `
                  FROM ${this._name}
                  LEFT JOIN users on users.id = ${this._name}.creator_id


                  WHERE (
                        ${this._name}.code LIKE '%${ this._key }%'
                  )
                  ${selWithDate + selWithIsDel }
                  GROUP BY coupons.id
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
           }).catch((err) => { reject(err)  })


        });



      })
    },
  });



  return Coupon;
};
