'use strict'

const requestBodiesFromSchemas = oapi => {
  if (oapi.components.schemas) {
    oapi.components.requestBodies = { ...oapi.components.requestBodies }
    Object.entries(oapi.components.schemas).forEach(([schema, schemaValue]) => {
      if (schema !== 'Error') {
        oapi.components.requestBodies[`${schema}`] = {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/' + schema
              }
            }
          },
          description: 'Ok'
        }
      }
    })
  }
  return oapi
}

module.exports = openApi => requestBodiesFromSchemas(openApi)
