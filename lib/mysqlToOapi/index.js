const mysql = require('mysql')
const baseOapi = require('../../build/baseoapi.json')
const common = require('../common')
const pathsFromSchemas = require('../pathsFromSchemas')
const responsesFromSchemas = require('../responsesFromSchemas')
const requestBodiesFromSchemas = require('../requestBodiesFromSchemas')

const validator = require('oas-validator')

const basicTypes = {
  tinyint: 'integer',
  int: 'integer',
  varchar: 'string',
  datetime: 'string',
  text: 'string'
}

const getOapiType = type => basicTypes[type] || type

const mysqlToOapi = config => {
  // const connection = mysql.createConnection(config.mysql)
  const pool = mysql.createPool({ connectionLimit: 10, ...config.mysql })
  const sql = 'select table_schema as database_name, table_name from information_schema.tables where table_type = \'BASE TABLE\' and table_schema = database() order by database_name, table_name;'
  return new Promise((resolve, reject) => {
    pool.query(sql, function (error, results, fields) {
      if (error) throw reject(error)
      resolve(results)
    })
  }).then(tables =>
    Promise.all(tables.map((table) =>
      Promise.all([
        new Promise((resolve, reject) => {
          const sql = `SELECT * FROM information_schema.columns WHERE table_schema='${config.mysql.database}' AND table_name='${table.table_name}'`
          pool.query(sql, function (error, results, fields) {
            if (error) throw reject(error)
            resolve({ table: table.table_name, columns: results })
          })
        }),
        new Promise((resolve, reject) => {
          const sql = `SELECT * FROM information_schema.key_column_usage WHERE table_schema='${config.mysql.database}' AND table_name='${table.table_name}'`
          pool.query(sql, function (error, results, fields) {
            if (error) throw reject(error)
            resolve({ table: table.table_name, columns: results })
          })
        }),
        new Promise((resolve, reject) => {
          const sql = `SELECT * FROM information_schema.key_column_usage WHERE table_schema='${config.mysql.database}' AND referenced_table_name='${table.table_name}'`
          pool.query(sql, function (error, results, fields) {
            if (error) throw reject(error)
            resolve({ table: table.table_name, columns: results })
          })
        })
      ])
    ))
  ).then(result => {
    const oapi = { ...baseOapi }

    result.forEach(res => {
      // console.log(res[0].columns)
      oapi.components.schemas[res[0].table] = {
        type: 'object',
        properties: res[0].columns.reduce((acu, cur) => {
          // console.log(cur)
          if (cur.COLUMN_KEY === 'PRI') return acu

          acu[cur.COLUMN_NAME] = {
            type: getOapiType(cur.DATA_TYPE),
            'x-ls': {
              desc: cur.COLUMN_COMMENT
            }
          }
          if (cur.CHARACTER_MAXIMUM_LENGTH) {
            acu[cur.COLUMN_NAME] = {
              ...acu[cur.COLUMN_NAME],
              maxLength: cur.CHARACTER_MAXIMUM_LENGTH
            }
          }
          return acu
        }, {}),
        'x-ls': {
          belongsTo: res[1].columns.reduce((acu, cur) => {
            if (cur.REFERENCED_TABLE_NAME) {
              acu[`${cur.COLUMN_NAME}-${common.capitalize(cur.TABLE_NAME)}`] = {
                name: cur.CONSTRAINT_NAME,
                columnName: cur.COLUMN_NAME,
                tableName: common.capitalize(cur.TABLE_NAME),
                referencedTableName: common.capitalize(cur.REFERENCED_TABLE_NAME),
                referencedColumnName: cur.REFERENCED_COLUMN_NAME,
                summaryProperty: cur.REFERENCED_COLUMN_NAME
              }
            }
            return acu
          }, {}),
          hasMany: res[2].columns.reduce((acu, cur) => {
            acu[`${cur.COLUMN_NAME}-${common.capitalize(cur.TABLE_NAME)}`] = {
              name: cur.CONSTRAINT_NAME,
              columnName: cur.COLUMN_NAME,
              tableName: common.capitalize(cur.TABLE_NAME),
              referencedTableName: common.capitalize(cur.REFERENCED_TABLE_NAME),
              referencedColumnName: cur.REFERENCED_COLUMN_NAME,
              summaryProperty: cur.REFERENCED_COLUMN_NAME
            }
            return acu
          }, {})
        }
      }
    })

    if (validator.validateSync(oapi, {})) {
      return oapi
    } else {
      Promise.reject(new Error('Invalid OpenApi Generated'))
    }
  })
    .then(oapi => responsesFromSchemas(oapi))
    .then(oapi => pathsFromSchemas(oapi))
    .then(oapi => requestBodiesFromSchemas(oapi))
    .then(res => {
      pool.end()
      return res
    })
    .then(res => res)
    .catch(console.log)
}

module.exports = config => config.mysql && mysqlToOapi(config)
