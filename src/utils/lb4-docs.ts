import {getModelSchemaRef} from '@loopback/rest'
import {IAddtionalPropertiesResponseSchema, IFilters, IRequestSchema, IResponseSchema, IWhereFilterCondition} from '../interfaces/http.interface'

function excludeDefaultParamsFromRequestSchema(additionalParams?: string[]): string[] {
    return ['_createdAt', '_createdBy', '_deletedAt', '_id', '_ownerId', ...(additionalParams ?? [])]
  }

  export function createDocRequestSchema(model: string | Function): IRequestSchema {
    return {
      'application/json': {
        schema: getModelSchemaRef(model as Function, {
          exclude: excludeDefaultParamsFromRequestSchema(),
          partial: true
        })
      }
    }
  }

  function responseSchema(additionalProperty: IAddtionalPropertiesResponseSchema): IResponseSchema {
    return {
      'statusCode': {type: 'number', default: 200},
      'message': {type: 'string'},
      ...(additionalProperty ?? {}),
    }
  }

  export function createDocResponseSchemaForFindManyResults(model: string | Function, includeRelations?: boolean): IResponseSchema {
    return responseSchema({
      'data': {
        type: 'object',
        properties: {
          'total': {type: 'number'},
          'result': {
            type: 'array',
            items: getModelSchemaRef(model as Function, {includeRelations: includeRelations ?? true}),
          }
        }
      }
    })
  }

  export function createDocResponseSchemaForFindOneResult(model: string | Function, includeRelations?: boolean): IResponseSchema {
    return responseSchema({
      'data': getModelSchemaRef(model as Function, {includeRelations: includeRelations ?? true})
    })
  }

  function extractConditionalParamsFromUrl(paramsFromUrl: URLSearchParams): IWhereFilterCondition[] {

    const whereArray: IWhereFilterCondition[] = [];

    paramsFromUrl.forEach((paramValue, paramKey) => {
      if (!['limit', 'page', 'order_by', 'filter'].includes(paramKey))
        whereArray.push({[paramKey]: {like: new RegExp('.*' + paramValue + '.*', "i")}})
    })

    return whereArray

  }

  function createFilters(paramsFromUrl: URLSearchParams, whereConditions: IWhereFilterCondition[]): IFilters {

    let where = JSON.parse(paramsFromUrl.get('filter') || '{}')
    if (whereConditions.length) where['and'] = [...(where['and'] || []), ...whereConditions]

    return {
      limit: (paramsFromUrl.get('limit') ?? 100) as number,
      skip: ((paramsFromUrl.get('limit') ?? 100) as number) * ((paramsFromUrl.get('page') ?? 0) as number),
      order: [(paramsFromUrl.get('order_by') ?? '_createdAt DESC')],
      where,
    }
  }

  export function createFilterRequestParams(urlString: string, whereAdditional?: IWhereFilterCondition[]): IFilters {

    const paramsFromUrl = new URL(`${process.env.SERVER_URI}${urlString}`).searchParams

    const where: IWhereFilterCondition[] = [
      ...extractConditionalParamsFromUrl(paramsFromUrl),
      ...(whereAdditional ?? []),
      {_deletedAt: {eq: null}},
    ]

    const filters = createFilters(paramsFromUrl, where)

    return filters

  }
