import {getModelSchemaRef, Request} from '@loopback/rest';
import {appendFileSync, existsSync, mkdir} from 'fs';
import {ILogObject, Logger} from 'tslog';
import {URL, URLSearchParams} from 'url';
import {HttpResponseTypeEnum} from '../../enums/http.enum';
import {LocaleEnum} from '../../enums/locale.enum';
import {IAddtionalPropertiesResponseSchema, IFilters, IHttpRequestResponse, IHttpResponse, IHttpResponseData, IRequestSchema, IResponseSchema, IWhereFilterCondition} from '../../interfaces/http.interface';
import {serverMessages} from '../../utils/server-messages';

export class HttpImplementation implements IHttpRequestResponse {

  private log: Logger

  constructor() {

    this.log = new Logger()

    this.log.attachTransport({
      silly: this.logToTransport,
      debug: this.logToTransport,
      trace: this.logToTransport,
      info: this.logToTransport,
      warn: this.logToTransport,
      error: this.logToTransport,
      fatal: this.logToTransport,
    }, "debug")

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

  private getMessage(httpResponseType: HttpResponseTypeEnum, localeMessage: LocaleEnum) {
    return serverMessages['httpResponse'][httpResponseType][localeMessage]
  }

  okHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse {

    this.log.info(
      httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.ok, httpResponseData?.locale ?? LocaleEnum['pt-BR']),
      this.loggerJson(httpResponseData?.request!)
    )

    httpResponseData?.response.status(200)
    return {
      statusCode: httpResponseData?.statusCode,
      data: httpResponseData?.data,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.ok, httpResponseData?.locale ?? LocaleEnum['pt-BR']),
    }

  }

  createHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse {

    this.log.info(
      httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.created, httpResponseData?.locale ?? LocaleEnum['pt-BR']),
      this.loggerJson(httpResponseData?.request!)
    )

    httpResponseData?.response.status(201)
    return {
      statusCode: httpResponseData?.statusCode,
      data: httpResponseData?.data,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.created, httpResponseData?.locale ?? LocaleEnum['pt-BR']),
    }

  }

  noContentHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse {

    this.log.info(
      httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.noContent, httpResponseData?.locale ?? LocaleEnum['pt-BR']),
      this.loggerJson(httpResponseData?.request!)
    )

    httpResponseData?.response.status(204)
    return {
      statusCode: httpResponseData?.statusCode,
      data: httpResponseData?.data,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.noContent, httpResponseData?.locale ?? LocaleEnum['pt-BR']),
    }

  }

  badRequestErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse {

    this.log.error(
      httpResponseData?.logMessage,
      this.loggerJson(httpResponseData?.request!)
    )

    httpResponseData?.response.status(400)
    return {
      statusCode: httpResponseData?.statusCode,
      data: httpResponseData?.data,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.badRequest, httpResponseData?.locale ?? LocaleEnum['pt-BR']),
      logMessage: httpResponseData?.logMessage,
    }

  }

  unauthorizedErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse {

    this.log.error(
      httpResponseData?.logMessage,
      this.loggerJson(httpResponseData?.request!)
    )

    httpResponseData?.response.status(401)
    return {
      statusCode: httpResponseData?.statusCode,
      data: httpResponseData?.data,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.unauthorized, httpResponseData?.locale ?? LocaleEnum['pt-BR']),
      logMessage: httpResponseData?.logMessage,
    }

  }

  notFoundErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse {

    this.log.error(
      httpResponseData?.logMessage,
      this.loggerJson(httpResponseData?.request!)
    )

    httpResponseData?.response.status(404)
    return {
      statusCode: httpResponseData?.statusCode,
      data: httpResponseData?.data,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.notFound, httpResponseData?.locale ?? LocaleEnum['pt-BR']),
      logMessage: httpResponseData?.logMessage,
    }

  }

  internalServerErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse {

    this.log.error(
      httpResponseData?.logMessage,
      this.loggerJson(httpResponseData?.request!)
    )

    httpResponseData?.response.status(500)
    return {
      statusCode: httpResponseData?.statusCode,
      data: httpResponseData?.data,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.internalServerError, httpResponseData?.locale ?? LocaleEnum['pt-BR']),
      logMessage: httpResponseData?.logMessage,
    }

  }
}
