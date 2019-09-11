'use strict'

const yaml = require('yaml')
const fs = require('fs')
const path = require('path')
const mustache = require('mustache')
module.exports = {
  yamlToObject: filePath => yaml.parse(fs.readFileSync(path.join(__dirname, filePath), 'utf8')),
  loadTemplate: filePath => fs.readFileSync(path.join(__dirname, filePath), 'utf8'),
  render: (template, view) => mustache.render(template, view),
  saveFile: (filePath, content) => fs.writeFileSync(path.join(__dirname, filePath), content)

}
