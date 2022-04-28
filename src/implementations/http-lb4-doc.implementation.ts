import {getModelSchemaRef} from '@loopback/rest';
import {URL, URLSearchParams} from 'url';
import {IAddtionalPropertiesResponseSchema, IFilters, IHttpDocumentation, IRequestSchema, IResponseSchema, IWhereFilterCondition} from '../interfaces/http.interface';

export class HttpLb4DocImplementation implements IHttpDocumentation {

  private excludeDefaultParamsFromRequestSchema(additionalParams?: string[]): string[] {
    return ['_createdAt', '_createdBy', '_deletedAt', '_id', '_ownerId', ...(additionalParams ?? [])]
  }

  public createDocRequestSchema(model: string | Function): IRequestSchema {
    return {
      'application/json': {
        schema: getModelSchemaRef(model as Function, {
          exclude: this.excludeDefaultParamsFromRequestSchema(),
          partial: true
        })
      }
    }
  }

  private responseSchema(additionalProperty: IAddtionalPropertiesResponseSchema): IResponseSchema {
    return {
      'statusCode': {type: 'number', default: 200},
      'message': {type: 'string'},
      ...(additionalProperty ?? {}),
    }
  }

  public createDocResponseSchemaForFindManyResults(model: string | Function, includeRelations?: boolean): IResponseSchema {
    return this.responseSchema({
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

  public createDocResponseSchemaForFindOneResult(model: string | Function, includeRelations?: boolean): IResponseSchema {
    return this.responseSchema({
      'data': getModelSchemaRef(model as Function, {includeRelations: includeRelations ?? true})
    })
  }

  private extractConditionalParamsFromUrl(paramsFromUrl: URLSearchParams): IWhereFilterCondition[] {

    const whereArray: IWhereFilterCondition[] = [];

    paramsFromUrl.forEach((paramValue, paramKey) => {
      if (!['limit', 'page', 'order_by', 'filter'].includes(paramKey))
        whereArray.push({[paramKey]: {like: new RegExp('.*' + paramValue + '.*', "i")}})
    })

    return whereArray

  }

  private createFilters(paramsFromUrl: URLSearchParams, whereConditions: IWhereFilterCondition[]): IFilters {

    let where = JSON.parse(paramsFromUrl.get('filter') || '{}')
    if (whereConditions.length) where['and'] = [...(where['and'] || []), ...whereConditions]

    return {
      limit: (paramsFromUrl.get('limit') ?? 100) as number,
      skip: ((paramsFromUrl.get('limit') ?? 100) as number) * ((paramsFromUrl.get('page') ?? 0) as number),
      order: [(paramsFromUrl.get('order_by') ?? '_createdAt DESC')],
      where,
    }
  }

  createFilterRequestParams(urlString: string, whereAdditional?: IWhereFilterCondition[]): IFilters {

    const paramsFromUrl = new URL(`${process.env.SERVER_ROOT_URI}${urlString}`).searchParams

    const where: IWhereFilterCondition[] = [
      ...this.extractConditionalParamsFromUrl(paramsFromUrl),
      ...(whereAdditional ?? []),
      {_deletedAt: {eq: null}},
    ]

    const filters = this.createFilters(paramsFromUrl, where)

    return filters

  }
}
