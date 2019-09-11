'use strict'

const { mysqlToOapi } = require('../lib')

const config = {
  mysql: {
    host: '192.168.9.3',
    user: 'CI',
    password: 'CI',
    database: 'CI'
  }
}

mysqlToOapi(config).then(res => console.log(JSON.stringify(res)))
