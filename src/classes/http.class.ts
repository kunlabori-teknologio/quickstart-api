import {getModelSchemaRef, Request, Response} from '@loopback/rest'
import {appendFileSync, existsSync, mkdir} from 'fs'
import {JwtPayload, verify} from 'jsonwebtoken'
import {ILogObject, Logger} from 'tslog'
import {URL, URLSearchParams} from 'url'
import {IAddtionalPropertiesResponseSchema, IFilters, IHttp, IHttpResponseData, IHttpResponseDataWithHttpCode, IRequestSchema, IResponseSchema, IWhereFilterCondition} from '../interfaces/http.interface'
import {localeMessage, serverMessages} from '../utils/server-messages'

enum HttpResponseTypeEnum {
  ok = 'ok',
  created = 'created',
  noContent = 'noContent',
  badRequest = 'badRequestError',
  unauthorized = 'unauthorizedError',
  notFound = 'notFoundError',
  internalServerError = 'internalServerError'
}

export class HttpClass {
  private response: Response | undefined
  private request: Request | undefined
  private log: Logger

  constructor(
    http?: IHttp
  ) {
    this.response = http?.response
    this.request = http?.request
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
    );
  }

  public requestSchema(model: Function, partial?: boolean): IRequestSchema {
    return {
      'application/json': {
        schema: getModelSchemaRef(model, {
          exclude: this.excludeDefaultParamsFromRequestSchema(),
          partial: partial ?? false
        })
      }
    }
  }

  private responseSchema(additionalProperty: IAddtionalPropertiesResponseSchema): IResponseSchema {
    return {
      'statusCode': {type: 'number', default: 200}, 'message': {type: 'string'},
      ...(additionalProperty ?? {}),
    }
  }

  public findOneSchema(responseModel: Function, includeRelations?: boolean): IResponseSchema {
    return this.responseSchema({
      'data': getModelSchemaRef(responseModel, {includeRelations: includeRelations ?? true})
    })
  }

  public findAllResponseSchema(responseModel: Function, includeRelations?: boolean): IResponseSchema {
    return this.responseSchema({
      'data': {
        type: 'object',
        properties: {
          'total': {type: 'number'},
          'result': {
            type: 'array',
            items: getModelSchemaRef(responseModel, {includeRelations: includeRelations ?? true}),
          }
        }
      }
    })
  }

  public createFilterRequestParams(urlString: string, whereAdditional?: IWhereFilterCondition[]): IFilters {
    const paramsFromUrl = new URL(`${process.env.SERVER_ROOT_URI}${urlString}`).searchParams
    const where: IWhereFilterCondition[] = [...this.extractConditionalParamsFromUrl(paramsFromUrl), ...(whereAdditional ?? [])]
    const filters = this.createFilters(paramsFromUrl, where)
    return filters
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

  public excludeDefaultParamsFromRequestSchema(additionalParams?: string[]): string[] {
    return ['_createdAt', '_createdBy', '_id', '_ownerId', ...(additionalParams ?? [])]
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

  private httpResponse(httpResponseData: IHttpResponseDataWithHttpCode): void {
    this.response?.status(httpResponseData.httpCode!);
    this.response?.send({
      statusCode: httpResponseData.statusCode ?? httpResponseData.httpCode,
      message: httpResponseData.message,
      data: httpResponseData.data,
    });
  }

  public getMessage(httpResponseType: HttpResponseTypeEnum) {
    return serverMessages['httpResponse'][httpResponseType][localeMessage]
  }

  public okResponse(httpResponseData?: IHttpResponseData): void {
    this.log.info(httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.ok), this.loggerJson(this.request!))
    this.httpResponse({
      ...httpResponseData,
      httpCode: 200,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.ok),
    });
  }

  public createResponse(httpResponseData?: IHttpResponseData): void {
    this.log.info(httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.created), this.loggerJson(this.request!))
    this.httpResponse({
      ...httpResponseData,
      httpCode: 201,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.created),
    });
  }

  public noContentResponse(httpResponseData?: IHttpResponseData): void {
    this.log.info(httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.noContent), this.loggerJson(this.request!))
    this.httpResponse({
      ...httpResponseData,
      httpCode: 204,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.noContent),
    });
  }

  public badRequestErrorResponse(httpResponseData?: IHttpResponseData): void {
    this.log.error(httpResponseData?.logMessage, this.loggerJson(this.request!))
    this.httpResponse({
      ...httpResponseData,
      httpCode: 400,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.badRequest),
    });
  }

  public unauthorizedErrorResponse(httpResponseData?: IHttpResponseData): void {
    this.log.error(httpResponseData?.logMessage, this.loggerJson(this.request!))
    this.httpResponse({
      ...httpResponseData,
      httpCode: 401,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.unauthorized),
    });
  }

  public notFoundErrorResponse(httpResponseData?: IHttpResponseData): void {
    this.log.error(httpResponseData?.logMessage, this.loggerJson(this.request!))
    this.httpResponse({
      ...httpResponseData,
      httpCode: 404,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.notFound),
    });
  }

  public internalServerErrorResponse(httpResponseData?: IHttpResponseData): void {
    this.log.error(httpResponseData?.logMessage, this.loggerJson(this.request!))
    this.httpResponse({
      ...httpResponseData,
      httpCode: 500,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.internalServerError),
    });
  }

  public verifyToken(token: string, secret: string): JwtPayload | void {
    try {
      if (!token) throw new Error(serverMessages['auth']['noAuthToken'][localeMessage])
      const authToken = token.split(' ')[1]
      return verify(authToken, secret) as JwtPayload
    } catch (err) {
      let message = serverMessages['httpResponse']['unauthorizedError'][localeMessage]
      let statusCode = 401
      switch (err.name) {
        case 'TokenExpiredError':
          message = serverMessages['auth']['expiredAuthToken'][localeMessage]
          statusCode = 602
          break
        case 'JsonWebTokenError':
          message = serverMessages['auth']['invalidAuthToken'][localeMessage]
          statusCode = 603
          break
        default:
          break
      }
      this.unauthorizedErrorResponse({logMessage: err.message, message, statusCode})
    }
  }
}
