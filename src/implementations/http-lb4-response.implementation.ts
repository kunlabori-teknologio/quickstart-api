import {Request} from '@loopback/rest';
import {appendFileSync, existsSync, mkdir} from 'fs';
import {ILogObject, Logger} from 'tslog';
import {HttpResponseTypeEnum} from '../enums/http.enum';
import {LocaleEnum} from '../enums/locale.enum';
import {IHttpResponse, IHttpResponseData, IHttpResponseToClient} from '../interfaces/http.interface';
import {serverMessages} from '../utils/server-messages';

export class HttpLb4ResponseImplementation implements IHttpResponseToClient {

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
      statusCode: httpResponseData?.statusCode ?? 200,
      data: httpResponseData?.data,
      tokens: httpResponseData?.tokens,
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
      statusCode: httpResponseData?.statusCode ?? 201,
      data: httpResponseData?.data,
      tokens: httpResponseData?.tokens,
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
      statusCode: httpResponseData?.statusCode ?? 204,
      data: httpResponseData?.data,
      tokens: httpResponseData?.tokens,
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
      statusCode: httpResponseData?.statusCode ?? 400,
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
      statusCode: httpResponseData?.statusCode ?? 401,
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
      statusCode: httpResponseData?.statusCode ?? 404,
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
      statusCode: httpResponseData?.statusCode ?? 500,
      data: httpResponseData?.data,
      message: httpResponseData?.message ?? this.getMessage(HttpResponseTypeEnum.internalServerError, httpResponseData?.locale ?? LocaleEnum['pt-BR']),
      logMessage: httpResponseData?.logMessage,
    }

  }
}
