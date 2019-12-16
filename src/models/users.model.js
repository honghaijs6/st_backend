// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
'use strict';

const sendMail = require('../hooks/ultil/sendMail');


const base64 = require('base64-utf8');
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

const MODE = 'users';


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
        autoIncrement:true


     },
    username:{
      type:DataTypes.STRING,
      defaultValue:null
    },

    position:{
      type:DataTypes.STRING,
      defaultValue:null
    },
    gender:{
      type:DataTypes.TINYINT,
      defaultValue:1 // MALE
    },
    name:{
      type:DataTypes.STRING,
      defaultValue:null
    },
    photoURL:{
      type:DataTypes.STRING,
      defaultValue:null
    },
    total_point:{
      type:DataTypes.INTEGER,
      defaultValue:0
    },
    password:{
      type:DataTypes.STRING,
      defaultValue:null
    },
    job_level:{
      type:DataTypes.TINYINT,
      defaultValue:2
    },
    job_type:{
      type:DataTypes.TINYINT,
      defaultValue:2
    },
    is_affiliated:{
      type:DataTypes.TINYINT,
      defaultValue:0
    },
    is_leader:{
      type:DataTypes.TINYINT,
      defaultValue:0
    },
    status:{
      type:DataTypes.TINYINT,
      defaultValue:0
    },
    is_deleted:{
      type:DataTypes.TINYINT,
      defaultValue:0
    },
    collections_tags:{
      type:DataTypes.TEXT,
      defaultValue:null
    },
    deleted_by:{
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
    office_id:{
      type:DataTypes.INTEGER,
      defaultValue:0
    },
    department_id:{
      type:DataTypes.INTEGER,
      defaultValue:0
    },
    store_id:{
      type:DataTypes.INTEGER,
      defaultValue:0
    },
    group_user_id:{
      type:DataTypes.INTEGER,
      defaultValue:0
    },
    salary_balance:{
      type:DataTypes.DECIMAL(11,2),
      defaultValue:0
    },
    commission_balance:{
      type:DataTypes.DECIMAL(11,2),
      defaultValue:0
    },
    salary_set:{
      type:DataTypes.DECIMAL(11,2),
      defaultValue:0
    },

    date_created:Sequelize.DATE,
    date_modified:Sequelize.DATE,
    date_deleted:Sequelize.DATE,

    phone:{
      type:DataTypes.STRING,
      defaultValue:null
    },
    email:{
      type:DataTypes.STRING,
      defaultValue:null
    },

    is_limit_ip_chamcong:{
      type:DataTypes.TINYINT,
      defaultValue:0
    }

  });

  Object.assign(model,{

      _name:'users',

      _maxPage:paginate.max,
      _page:0,
      _key:'',

      sort_by:'date_created',
      sort_type:'DESC',


      update(data=null,condition=null){

        return new Promise((resolve,reject)=>{
           model.update(data,condition).then((res)=>{
             resolve(res);
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


           const isDel = query.is_deleted || 0 ;


           const selWithDate = query.start !== undefined ?  ` AND ( ${this._name}.date_created >='${query.start} 00:00:00' and ${this._name}.date_created <= '${query.end} 23:59:00'  ) `  : "";
           const selWithIsDel = ` AND ${this._name}.is_deleted = ${isDel} `;

           const selWithJob_level = query.job_level !== undefined ? ` AND users.job_level = ${query.job_level}  ` : '';
           const selWithJob_type = query.job_type !== undefined ? ` AND users.job_type = ${query.job_type} ` : '';

           const limit = this._maxPage !=='all' ? ` LIMIT ${this._page}, ${this._maxPage} ` : "";

           let sql = ` SELECT  ${this._name}.*,
                         offices.name as office_name,
                         departments.name as department_name,
                         stores.name as store_name

           `;

           const arr_type_condition = {

             "count":`
                FROM users
                WHERE (
                    users.username LIKE '%${ this._key }%' OR
                    users.name LIKE '%${ this._key }%' OR
                    users.phone LIKE '%${ this._key }%' OR
                    users.email LIKE '%${ this._key }%'
                )

                    ${selWithDate + selWithJob_level + selWithJob_type + selWithIsDel }
             `,
             "all": `
                     FROM ${this._name}

                     LEFT JOIN offices on offices.id = users.office_id
                     LEFT JOIN departments on departments.id = users.department_id
                     LEFT JOIN stores on stores.id = users.store_id
                     LEFT JOIN regions on regions.id = users.region_code

                     WHERE (
                         users.username LIKE '%${ this._key }%' OR
                         users.name LIKE '%${ this._key }%' OR
                         users.phone LIKE '%${ this._key }%' OR
                         users.email LIKE '%${ this._key }%'
                     )


                     ${selWithDate + selWithJob_level + selWithJob_type + selWithIsDel }
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

         const query = ` SELECT

                            ${this._name}.*,
                            companies.name as company, companies.point_formula,
                            offices.name as office_name,
                            departments.name as department_name,
                            stores.name as store_name,
                            group_users.name as group_name


                         FROM ${this._name}

                         LEFT JOIN companies on companies.id = ${this._name}.company_id
                         LEFT JOIN offices on offices.id = users.office_id
                         LEFT JOIN departments on departments.id = users.department_id
                         LEFT JOIN stores on stores.id = users.store_id
                         LEFT JOIN regions on regions.id = users.region_code
                         LEFT JOIN group_users on group_users.id = users.group_user_id



                         WHERE ${this._name}.id = ${id}
                       `;
         sequelize.query(query).spread((results, metadata) => {

           const data = results.length > 0 ? results[0] : {}
           resolve(data);

         });

        });
      },

      /*
      - xác nhận e-mail tồn tại
      - gui email cho user click vào link xác nhận xác nhận
      */
      async forgotPass(email=''){

        const ret = {
          name:'error',
          message:'',
          data:{}
        }


        const isExisted = await this.isExisted(email);

        return new Promise((resolve,reject)=>{
          if(isExisted.message==='yes'){

            // SEND MAIL XÁC NHẬN
            const jsonConfirm = {
              id:22,
              name:isExisted.data.name,
              email:email,
              date:'2019-07'
            }

            const logo = `http://kingkongmilktea.com/wp-content/uploads/2018/11/KING-KONG-Milktea-Juice_FINAL-Recovered-06.png`;

            const retSendMail =  sendMail(null,{
              to:email,
              subject:'Xác nhận quên mật khẩu',
              content:`
                <div style="font-size:15px; line-height:24px; color:#333; background:#CCCCCC; padding:30px">
                  <div style="width:800px; margin:auto; background:#fff; border-radius:6px;">
                      <div style="background:#18A689; padding:20px; border-top-left-radius:6px; border-top-right-radius:6px;">
                          <div>
                            <img style="height:80px" src="${logo}"/>
                          </div>
                      </div>
                      <div style=" padding:20px;">
                        <h4 style="color:#18A689; ">Xin chào ${isExisted.data.name},</h4>
                        Hệ thống của chúng tôi vừa nhận yêu cầu của bạn boặc một ai đó báo rằng <br/>
                        bạn đã quên mật khẩu, chúng tôi gủi email này để bạn xác nhận nếu đúng <br/>
                        xin vui lòng click vào đường link này để xác nhận <br/>
                        <p>
                          <a
                            style="padding:5px 20px; border-radius:6px; background:#18A689; color:#fff; text-decoration:none"
                            href="http://localhost:3333/confirm?ref=${ base64.encode(JSON.stringify(jsonConfirm)) }">
                            Tôi xác nhận quên mật khẩu
                          </a>
                        <p>
                        <br/>
                        <p>
                            Best, <br/>
                            Nhóm hỗ trợ
                        </p>
                      </div>

                  </div>
                </div>
              `
            });
            resolve(retSendMail);


          }else{
            resolve(Object.assign(ret,{
              name:'error-forgotPass',
              message:'Email này không tồn tại'
            }))
          }
        })


      },
      // JSON CONDITION  default e-mail
      isExisted(email){
        return new Promise((resolve,reject)=>{

           model.findOne({
             where: { email:email },
             attributes: ['id','name','email']
           }).then(idata => {

             const data = idata || {};
             const ret = {
               name:"success",
               message:JSON.stringify(data)==="{}" ? "no" : "yes",
               data:JSON.stringify(data)==="{}" ? {} : data
             }
             resolve( ret );

           });

        })
     }
  })


  return model;



};
