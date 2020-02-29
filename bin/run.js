'use strict'

const { mysqlToOapi, common } = require('../lib')

const config = {
  mysql: {
    host: '192.168.9.3',
    user: 'CI',
    password: 'CI',
    database: 'Horis'
  }
}

mysqlToOapi(config).then(res => common.saveFile('../../dist/mysqlToOapi/fromMysql.json', JSON.stringify(res, null, 2)))
