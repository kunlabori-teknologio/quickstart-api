import {getModelSchemaRef, Response} from '@loopback/rest'
import jwt, {JwtPayload} from 'jsonwebtoken'
import {URL, URLSearchParams} from 'url'
import {IHttp, IHttpResponseData, IHttpResponseDataWithHttpCode} from '../interfaces/http.interface'
import {localeMessage, serverMessages} from '../utils/server-messages'

enum httpResponseTypeEnum {
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

  constructor(http?: IHttp) {
    this.response = http?.response
  }

  public requestSchema(model: any, partial?: boolean): any {
    return {
      'application/json': {
        schema: getModelSchemaRef(model, {
          exclude: this.excludeDefaultParamsFromRequestSchema(),
          partial: partial ?? false
        })
      }
    }
  }

  private responseSchema(additionalProperty: any): any {
    return {
      'statusCode': {type: 'number', default: 200}, 'message': {type: 'string'},
      ...(additionalProperty ?? {}),
    }
  }

  public findOneSchema(responseModel: any, includeRelations?: boolean): any {
    return this.responseSchema({
      'data': getModelSchemaRef(responseModel, {includeRelations: includeRelations ?? true})
    })
  }

  public findAllResponseSchema(responseModel: any, includeRelations?: boolean): any {
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

  public createFilterRequestParams(urlString: string, whereAdditional?: any[]): any {
    const paramsFromUrl = new URL(`${process.env.SERVER_ROOT_URI}${urlString}`).searchParams
    let where = [...this.extractConditionalParamsFromUrl(paramsFromUrl), ...(whereAdditional ?? [])]
    const filters = this.createFilters(paramsFromUrl, where)
    return filters
  }

  private extractConditionalParamsFromUrl(paramsFromUrl: URLSearchParams): any[] {
    let whereArray: any[] = [];
    paramsFromUrl.forEach((paramValue, paramKey) => {
      if (!['limit', 'page', 'order_by'].includes(paramKey))
        whereArray.push({[paramKey]: {like: new RegExp('.*' + paramValue + '.*', "i")}})
    })
    return whereArray
  }

  private createFilters(paramsFromUrl: URLSearchParams, whereConditions: any[]) {
    return {
      limit: (paramsFromUrl.get('limit') ?? 100) as number,
      skip: ((paramsFromUrl.get('limit') ?? 100) as number) * ((paramsFromUrl.get('page') ?? 0) as number),
      order: [(paramsFromUrl.get('order_by') || '')],
      where: whereConditions.length ? {'and': whereConditions} : {},
    }
  }

  public excludeDefaultParamsFromRequestSchema(additionalParams?: string[]): string[] {
    return ['_createdAt', '_createdBy', '_id', '_ownerId', ...(additionalParams ?? [])]
  }

  private httpResponse(httpResponseData: IHttpResponseDataWithHttpCode): void {
    this.response?.status(httpResponseData.httpCode!);
    this.response?.send({
      statusCode: httpResponseData.statusCode || httpResponseData.httpCode,
      message: httpResponseData.message,
      data: httpResponseData.data,
    });
  }

  public getMessage(httpResponseType: httpResponseTypeEnum) {
    return serverMessages['httpResponse'][httpResponseType][localeMessage]
  }

  public okResponse(httpResponseData?: IHttpResponseData): void {
    console.info(httpResponseData?.message || this.getMessage(httpResponseTypeEnum.ok))
    this.httpResponse({
      ...httpResponseData,
      httpCode: 200,
      message: httpResponseData?.message || this.getMessage(httpResponseTypeEnum.ok),
    });
  }

  public createResponse(httpResponseData?: IHttpResponseData): void {
    console.info(httpResponseData?.message || this.getMessage(httpResponseTypeEnum.created))
    this.httpResponse({
      ...httpResponseData,
      httpCode: 201,
      message: httpResponseData?.message || this.getMessage(httpResponseTypeEnum.created),
    });
  }

  public noContentResponse(httpResponseData?: IHttpResponseData): void {
    console.info(httpResponseData?.message || this.getMessage(httpResponseTypeEnum.noContent))
    this.httpResponse({
      ...httpResponseData,
      httpCode: 204,
      message: httpResponseData?.message || this.getMessage(httpResponseTypeEnum.noContent),
    });
  }

  public badRequestErrorResponse(httpResponseData?: IHttpResponseData): void {
    console.error(httpResponseData?.logMessage)
    this.httpResponse({
      ...httpResponseData,
      httpCode: 400,
      message: httpResponseData?.message || this.getMessage(httpResponseTypeEnum.badRequest),
    });
  }

  public unauthorizedErrorResponse(httpResponseData?: IHttpResponseData): void {
    console.error(httpResponseData?.logMessage)
    this.httpResponse({
      ...httpResponseData,
      httpCode: 401,
      message: httpResponseData?.message || this.getMessage(httpResponseTypeEnum.unauthorized),
    });
  }

  public notFoundErrorResponse(httpResponseData?: IHttpResponseData): void {
    console.error(httpResponseData?.logMessage)
    this.httpResponse({
      ...httpResponseData,
      httpCode: 404,
      message: httpResponseData?.message || this.getMessage(httpResponseTypeEnum.notFound),
    });
  }

  public internalServerErrorResponse(httpResponseData?: IHttpResponseData): void {
    console.error(httpResponseData?.logMessage)
    this.httpResponse({
      ...httpResponseData,
      httpCode: 500,
      message: httpResponseData?.message || this.getMessage(httpResponseTypeEnum.internalServerError),
    });
  }

  public verifyToken(token: string, secret: string): JwtPayload | void {
    try {
      let authToken = token.split(' ')[1]
      return jwt.verify(authToken, secret) as JwtPayload
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
