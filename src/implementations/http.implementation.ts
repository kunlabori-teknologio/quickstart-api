import {getModelSchemaRef, Request} from '@loopback/rest';
import {appendFileSync, existsSync, mkdir} from 'fs';
import {ILogObject, Logger} from 'tslog';
import {URL, URLSearchParams} from 'url';
import {HttpResponseTypeEnum} from '../enums/http.enum';
import {localeMessage, serverMessages} from '../utils/server-messages';
import {IAddtionalPropertiesResponseSchema, IFilters, IHttpRequestResponse, IHttpResponseData, IHttpResponseDataWithHttpCode, IRequestSchema, IResponseSchema, IWhereFilterCondition} from './../interfaces/http.interface';

export class Http implements IHttpRequestResponse {

  private log: Logger

  constructor() {
    this.log = new Logger()
    this.log.attachTransport(
      {
        silly: this.logToTransport,
        debug: this.logToTransport,
        trace: this.logToTransport,
        info: this.logToTransport,
        warn: this.logToTransport,
        error: this.logToTransport,
        fatal: this.logToTransport,
      },
      "debug"
    )
  }

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
      'logMessage': {type: 'string'},
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
      if (!['limit', 'page', 'order_by'].includes(paramKey))
        whereArray.push({[paramKey]: {like: new RegExp('.*' + paramValue + '.*', "i")}})
    })
    return whereArray
  }

  private createFilters(paramsFromUrl: URLSearchParams, whereConditions: IWhereFilterCondition[]): IFilters {
    return {
      limit: (paramsFromUrl.get('limit') ?? 100) as number,
      skip: ((paramsFromUrl.get('limit') ?? 100) as number) * ((paramsFromUrl.get('page') ?? 0) as number),
      order: [(paramsFromUrl.get('order_by') ?? '')],
      where: whereConditions.length ? {'and': whereConditions} : {},
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

  private loggerJson(request: Request) {
    return {
      route: request.url,
      method: request.method,
      body: request.body || {}
    }
  }

  private logToTransport(logObject: ILogObject) {
    const fileName = new Date().toISOString().substring(0, 10)
    const path = './src/logs/'
    if (!existsSync(path)) mkdir('./src/logs/', () => { })
    appendFileSync(`./src/logs/[${logObject.logLevel}] ${fileName}.log`, JSON.stringify(logObject) + "\n")
  }

  private getMessage(httpResponseType: HttpResponseTypeEnum) {
    return serverMessages['httpResponse'][httpResponseType][localeMessage]
  }

  private createResponse(httpResponseData: IHttpResponseDataWithHttpCode): IHttpResponseDataWithHttpCode {
    return {
      httpCode: httpResponseData?.httpCode,
      statusCode: httpResponseData?.statusCode ?? httpResponseData?.httpCode,
      message: httpResponseData?.message,
      logMessage: httpResponseData?.logMessage,
      data: httpResponseData?.data,
    };
  }

  okHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode {
    this.log.info(httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.ok), this.loggerJson(httpResponseData?.request!))
    return this.createResponse({
      ...httpResponseData,
      httpCode: 200,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.ok),
    })
  }

  createHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode {
    this.log.info(httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.created), this.loggerJson(httpResponseData?.request!))
    return this.createResponse({
      ...httpResponseData,
      httpCode: 201,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.created),
    })
  }

  noContentHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode {
    this.log.info(httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.noContent), this.loggerJson(httpResponseData?.request!))
    return this.createResponse({
      ...httpResponseData,
      httpCode: 204,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.noContent),
    })
  }

  badRequestErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode {
    this.log.error(httpResponseData?.logMessage, this.loggerJson(httpResponseData?.request!))
    return this.createResponse({
      ...httpResponseData,
      httpCode: 400,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.badRequest),
    })
  }

  unauthorizedErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode {
    this.log.error(httpResponseData?.logMessage, this.loggerJson(httpResponseData?.request!))
    return this.createResponse({
      ...httpResponseData,
      httpCode: 401,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.unauthorized),
    })
  }

  notFoundErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode {
    this.log.error(httpResponseData?.logMessage, this.loggerJson(httpResponseData?.request!))
    return this.createResponse({
      ...httpResponseData,
      httpCode: 404,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.notFound),
    })
  }

  internalServerErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode {
    this.log.error(httpResponseData?.logMessage, this.loggerJson(httpResponseData?.request!))
    return this.createResponse({
      ...httpResponseData,
      httpCode: 500,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.internalServerError),
    })
  }
}
