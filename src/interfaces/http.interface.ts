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

export interface IHttpResponseData {
  statusCode?: number,
  message?: string,
  logMessage?: string,
  data?: {},
  tokens?: {},
  request: Request,
  response: Response,
}

export interface IHttpResponse {
  statusCode?: number,
  message?: string,
  logMessage?: string,
  data?: {},
  tokens?: {},
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
  [x: string]: (string | null | Boolean | IWhereFilterCondition[]) |
  {like: RegExp;} |
  {[x: string]: string | null | Boolean | IWhereFilterCondition}
}

export interface IHttpDocumentation {
  createDocRequestSchema(model: string | Function): IRequestSchema
  createDocResponseSchemaForFindManyResults(model: string | Function, includeRelations?: boolean): IResponseSchema
  createDocResponseSchemaForFindOneResult(model: string | Function, includeRelations?: boolean): IResponseSchema
  createFilterRequestParams(urlString: string, whereAdditional?: IWhereFilterCondition[]): IFilters
}

export interface IHttpResponseToClient {
  okHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse
  createHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse
  noContentHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse
  badRequestErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse
  unauthorizedErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse
  notFoundErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse
  internalServerErrorHttpResponse(httpResponseData?: IHttpResponseData): IHttpResponse
}
