'use strict'

const getResponses = schema => ({
  responses: {
    200: {
      $ref: '#/components/responses/' + schema
    },
    400: {
      $ref: '#/components/responses/NotFound'
    },
    500: {
      $ref: '#/components/responses/Default'
    },
    default: {
      $ref: '#/components/responses/Default'
    }
  }
})

const pathsFromSchemas = oapi => {
  if (oapi.components.schemas) {
    Object.entries(oapi.components.schemas).forEach(([schema, schemaValue]) => {
      if (schema !== 'Error') {
        oapi.paths[`/${schema}`] = {
          get: {
            operationId: `get${schema}`,
            summary: `Get ${schema} List`,
            ...getResponses(`${schema}List`)
          },
          post: {
            operationId: `post${schema}`,
            summary: `Post ${schema} List`,
            ...getResponses('Success')
          }
        }
        oapi.paths[`/${schema}/{id}`] = {
          get: {
            operationId: `get${schema}byID`,
            summary: `Get ${schema} by ID`,
            ...getResponses('Success'),
            parameters: [
              {
                $ref: '#/components/parameters/id'
              }
            ]
          },
          delete: {
            operationId: `delete${schema}byID`,
            summary: `Delete ${schema} by ID`,
            ...getResponses('Success'),
            parameters: [
              {
                $ref: '#/components/parameters/id'
              }
            ]
          },
          patch: {
            operationId: `patch${schema}byID`,
            summary: `Patch ${schema} by ID`,
            ...getResponses('Success'),
            parameters: [
              {
                $ref: '#/components/parameters/id'
              }
            ]
          },
          put: {
            operationId: `put${schema}byID`,
            summary: `Put ${schema} by ID`,
            ...getResponses('Success'),
            parameters: [
              {
                $ref: '#/components/parameters/id'
              }
            ]
          }
        }
      }
    })
  }
  return oapi
}

module.exports = openApi => pathsFromSchemas(openApi)
