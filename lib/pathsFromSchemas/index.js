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
            ...getResponses(`${schema}List`),
            'x-ls': {
              service: 'CRUD',
              method: 'List'
            }
          },
          post: {
            operationId: `post${schema}`,
            summary: `Post ${schema} List`,
            requestBody: {
              $ref: '#/components/requestBodies/' + schema
            },
            ...getResponses('Success'),
            'x-ls': {
              service: 'CRUD',
              method: 'Post',
              args: ['body']
            }
          }
        }
        oapi.paths[`/${schema}/{id}`] = {
          get: {
            operationId: `get${schema}byID`,
            summary: `Get ${schema} by ID`,
            ...getResponses(`${schema}`),
            parameters: [
              {
                $ref: '#/components/parameters/id'
              }
            ],
            'x-ls': {
              service: 'CRUD',
              method: 'getOne',
              args: ['id']
            }
          },
          delete: {
            operationId: `delete${schema}byID`,
            summary: `Delete ${schema} by ID`,
            ...getResponses('Success'),
            parameters: [
              {
                $ref: '#/components/parameters/id'
              }
            ],
            'x-ls': {
              service: 'CRUD',
              method: 'delete',
              args: ['id']
            }
          },
          patch: {
            operationId: `patch${schema}byID`,
            summary: `Patch ${schema} by ID`,
            ...getResponses('Success'),
            parameters: [
              {
                $ref: '#/components/parameters/id'
              }
            ],
            'x-ls': {
              service: 'CRUD',
              method: 'patch',
              args: ['id', 'body']
            }
          },
          put: {
            operationId: `put${schema}byID`,
            summary: `Put ${schema} by ID`,
            ...getResponses('Success'),
            parameters: [
              {
                $ref: '#/components/parameters/id'
              }
            ],
            'x-ls': {
              service: 'CRUD',
              method: 'put',
              args: ['id', 'body']
            }
          }
        }
      }
    })
  }
  return oapi
}

module.exports = openApi => pathsFromSchemas(openApi)
