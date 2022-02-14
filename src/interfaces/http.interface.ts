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
  request?: Request,
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
  [x: string]: (string | null | Boolean) | {like: RegExp;} | {[x: string]: string | null | Boolean}
}

export interface IHttpRequestResponse {

  createDocRequestSchema(model: string | Function): IRequestSchema;
  createDocResponseSchemaForFindManyResults(model: string | Function, includeRelations?: boolean): IResponseSchema;
  createDocResponseSchemaForFindOneResult(model: string | Function, includeRelations?: boolean): IResponseSchema;
  createFilterRequestParams(urlString: string, whereAdditional?: IWhereFilterCondition[]): IFilters;

  okHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode;
  createHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode;
  noContentHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode;
  badRequestErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode;
  unauthorizedErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode;
  notFoundErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode;
  internalServerErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponseDataWithHttpCode;
}
