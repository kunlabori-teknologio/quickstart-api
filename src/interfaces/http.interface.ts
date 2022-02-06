import {Request, Response} from '@loopback/rest';

export interface IRequestSchema {
  [x: string]: {
    schema: {}
  }
}

export interface IResponseSchema {
  statusCode: {},
  message: {},
  data: {},
  [x: string]: {}
}

export interface IAddtionalPropertiesResponseSchema {
  data: {},
  [x: string]: {}
}

export interface IHttp {
  response?: Response
  request?: Request
}

export interface IHttpResponseData {
  statusCode?: number,
  message?: string,
  logMessage?: string,
  data?: {},
}

export interface IHttpResponseDataWithHttpCode extends IHttpResponseData {
  httpCode: number,
}

export interface IFilters {
  limit: number,
  skip: number,
  order: string[],
  where: {
    [x: string]: IWhereFilterCondition[]
  } | {}
}

export interface IWhereFilterCondition {
  [x: string]: string | {like: RegExp;}
}
