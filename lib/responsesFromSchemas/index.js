'use strict'

const responsesFromSchemas = oapi => {
  if (oapi.components.schemas) {
    Object.entries(oapi.components.schemas).forEach(([schema, schemaValue]) => {
      if (schema !== 'Error') {
        oapi.components.responses[`${schema}`] = {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/' + schema
              }
            }
          },
          description: 'Ok'
        }
        oapi.components.responses[`${schema}List`] = {
          content: {
            'application/json': {
              schema: {
                items: {
                  $ref: '#/components/schemas/' + schema
                },
                type: 'array'
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

module.exports = openApi => responsesFromSchemas(openApi)
