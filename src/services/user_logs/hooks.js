const { authenticate } = require('@feathersjs/authentication').hooks;
const Helper = require('../../models/helper');

/* BEFORE : HTTP GET */
const pluginUserInfo = require('../../hooks/before/plugin-userinfo');
const defautSchemaGet = require('../../hooks/before/default-schema-get'); // -> GET Default SCHEMA QUERY DATABASE
/* POST */
const defaultSchemaPost = require('../../hooks/before/default-schema-post');
const buildJsonFieldPost = require('../../hooks/before/build-json-field-post');
const defaultKeyFieldPost = require('../../hooks/before/default-key-field-post');

/* ERROR*/
const consoleError = require('../../hooks/error/console-error');

/* HTTP: PUT */
const isMethod = require('../../hooks/before/isMethod');
const defaultSchemaPut = require('../../hooks/before/default-schema-put');
const defaultKeyFieldPut = require('../../hooks/before/default-key-field-put')

/* HTTP: DELETE */
const defaultSchemaDel = require('../../hooks/before/default-schema-del');



module.exports = {
  before: {
    all: [ ],
    find: [defautSchemaGet({Helper})],
    get: [],
    create: [
      authenticate('jwt'),
      //defaultSchemaPost({Helper,schema:['product_id']}), /* this guy return err: on missing Default field */
      //buildJsonFieldPost({ Helper ,schema :[,'name','address','phone'] }), // This guy create json field stringify
      //defaultKeyFieldPost(), // this guy : add field default : [creator_id - company_id] to data for save
      //pluginUserInfo()

    ],
    update: [
      authenticate('jwt'),
      isMethod({Helper}), /* this guy return to call a method  */
      defaultSchemaPut(), /* this guy format params query as object condition for update  */
      //defaultKeyFieldPut(), /* date_modified, log =[change ] */
      //pluginUserInfo()


    ],
    patch: [],
    remove: [
      authenticate('jwt'),
      defaultSchemaDel(), /*  this gus add field : date_deleleted - deleted_by -   */
      //pluginUserInfo()
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [consoleError()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
