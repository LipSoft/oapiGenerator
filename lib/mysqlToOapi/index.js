const mysql = require('mysql')
const baseOapi = require('../../build/baseoapi.json')

// this query shows relationships
// SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
// WHERE REFERENCED_TABLE_SCHEMA = 'db' AND REFERENCED_TABLE_NAME = 'tablename';

// SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
// WHERE TABLE_SCHEMA = 'CI' AND TABLE_NAME = 'artigos';

const basicTypes = {
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
        })
      ])
    ))
  ).then(result => {
    const oapi = { ...baseOapi }

    result.forEach(res => {
      // console.log(res[1].columns)
      oapi.components.schemas[res[0].table] = {
        type: 'object',
        properties: res[0].columns.reduce((acu, cur) => {
          // console.log(cur)
          acu[cur.COLUMN_NAME] = {
            type: getOapiType(cur.DATA_TYPE)
          }
          return acu
        }, {}),
        'x-ls': {
          constraints: res[1].columns.reduce((acu, cur) => {
            acu[cur.COLUMN_NAME] = {
              name: cur.CONSTRAINT_NAME,
              referencedTableName: cur.REFERENCED_TABLE_NAME,
              referencedColumnName: cur.REFERENCED_COLUMN_NAME
            }
            return acu
          }, {})
        }
      }
    })

    // generate openapi
    return oapi
  })
    .then(res => {
      pool.end()
      return res
    })
    .then(res => res)
    .catch(console.log)
}

module.exports = config => config.mysql && mysqlToOapi(config)
