import { applyDecorators, Type } from '@nestjs/common'
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger'

export const ApiPaginatedResponse = <T extends Type<unknown>>(model: T) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(model),
            },
          },
          meta: {
            type: 'object',
            properties: {
              total: {
                type: 'number',
              },
              lastPage: {
                type: 'number',
              },
              currentPage: {
                type: 'number',
              },
              totalPerPage: {
                type: 'number',
              },
              prevPage: {
                type: 'number',
                nullable: true,
              },
              nextPage: {
                type: 'number',
                nullable: true,
              },
            },
          },
        },
      },
    }),
  )
}
