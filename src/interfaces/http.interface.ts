import {Request, Response} from '@loopback/rest';

export interface IHttp {
  response?: Response
  request?: Request
}

export interface IHttpResponseData {
  statusCode?: number,
  message?: string,
  logMessage?: string,
  data?: any,
}

export interface IHttpResponseDataWithHttpCode extends IHttpResponseData {
  httpCode: number,
}
