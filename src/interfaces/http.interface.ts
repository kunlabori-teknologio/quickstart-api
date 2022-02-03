import {Response} from '@loopback/rest';

export interface IHttp {
  response?: Response
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
