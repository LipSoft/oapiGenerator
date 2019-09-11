const mysql = require('mysql')
const baseOapi = require('../../build/baseoapi.json')

// this query shows relationships
// SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
// WHERE REFERENCED_TABLE_SCHEMA = 'db' AND REFERENCED_TABLE_NAME = 'tablename';

const getOapiType = type => type

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
      new Promise((resolve, reject) => {
        const sql = `SELECT * FROM information_schema.columns WHERE table_schema='${config.mysql.database}' AND table_name='${table.table_name}'`
        pool.query(sql, function (error, results, fields) {
          if (error) throw reject(error)
          resolve({ table: table.table_name, columns: results })
        })
      })
    ))
  ).then(result => {
    const oapi = { ...baseOapi }
    result.forEach(res => {
      // console.log(res.table)
      oapi.components.schemas[res.table] = {
        type: 'object',
        properties: res.columns.reduce((acu, cur) => {
          // console.log(cur)
          acu[cur.COLUMN_NAME] = {
            type: getOapiType(cur.DATA_TYPE)
          }
          return acu
        }, {})
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
