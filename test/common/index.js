'use strict'

const { capitalize } = require('../../lib/common')

var assert = require('assert')

describe('#indexOf()', function () {
  it('should return Amazing ', () => assert.equal(capitalize('amazing'), 'Amazing'))
})
