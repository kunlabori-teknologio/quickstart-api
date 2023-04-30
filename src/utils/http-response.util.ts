import {Request} from '@loopback/rest';
import {appendFileSync, existsSync, mkdir} from 'fs';
import {ILogObject, Logger} from 'tslog';
import {
  IHttpResponse,
  IHttpResponseData
} from '../interfaces/http.interface';

const logToTransport = (logObject: ILogObject) => {
  const fileName = new Date().toISOString().substring(0, 10);

  const path = './src/logs/';

  if (!existsSync(path)) mkdir('./src/logs/', () => {});

  appendFileSync(
    `./src/logs/[${logObject.logLevel}] ${fileName}.log`,
    JSON.stringify(logObject) + '\n',
  );
};

const log = new Logger({ type: "hidden" });

log.attachTransport(
  {
    silly: logToTransport,
    debug: logToTransport,
    trace: logToTransport,
    info: logToTransport,
    warn: logToTransport,
    error: logToTransport,
    fatal: logToTransport,
  },
  'debug',
);

/**
 * Transform request to logger json
 * @param request
 * @returns object with route, method and body
 */
const loggerJson = (request: Request) => {
  return {
    route: request?.url,
    method: request?.method,
    body: request?.body || {},
  };
};

/**
 * Return a ok http response
 * @param httpResponseData
 * @returns object with status code, data and message
 */
export const okHttpResponse = (
  httpResponseData?: IHttpResponseData,
): IHttpResponse => {
  if (httpResponseData?.request) {
    log.info(
      httpResponseData?.message ?? 'Ok response successfully',
      loggerJson(httpResponseData?.request!),
    );
  }

  httpResponseData?.response?.status(200);
  return {
    statusCode: httpResponseData?.statusCode ?? 200,
    data: httpResponseData?.data,
    message: httpResponseData?.message ?? 'Ok response successfully',
  };
};

/**
 * Return a create http response
 * @param httpResponseData
 * @returns object with status code and message
 */
export const createHttpResponse = (
  httpResponseData?: IHttpResponseData,
): IHttpResponse => {
  if (httpResponseData?.request) {
    log.info(
      httpResponseData?.message ?? 'Create successfully',
      loggerJson(httpResponseData?.request!),
    );
  }

  httpResponseData?.response?.status(201);
  return {
    statusCode: httpResponseData?.statusCode ?? 201,
    data: httpResponseData?.data,
    message: httpResponseData?.message ?? 'Create successfully',
  };
};

/**
 * Return a no content http response
 * @param httpResponseData
 * @returns object with status code and message
 */
export const noContentHttpResponse = (
  httpResponseData?: IHttpResponseData,
): IHttpResponse => {
  if (httpResponseData?.request) {
    log.info(
      httpResponseData?.message ?? 'No content response',
      loggerJson(httpResponseData?.request!),
    );
  }

  httpResponseData?.response?.status(204);
  return {
    statusCode: httpResponseData?.statusCode ?? 204,
    data: httpResponseData?.data,
    message: httpResponseData?.message ?? 'No content response',
  };
};

/**
 * Return a bad request http response
 * @param httpResponseData
 * @returns object with status code and message
 */
export const badRequestErrorHttpResponse = (
  httpResponseData?: IHttpResponseData,
): IHttpResponse => {
  if (httpResponseData?.request) {
    log.error(
      httpResponseData?.message,
      loggerJson(httpResponseData?.request!),
    );
  }

  httpResponseData?.response?.status(400);
  return {
    statusCode: httpResponseData?.statusCode ?? 400,
    data: httpResponseData?.data,
    message: httpResponseData?.message,
  };
};

/**
 * Return a unauthorized http response error
 * @param httpResponseData
 * @returns object with status code and message
 */
export const unauthorizedErrorHttpResponse = (
  httpResponseData?: IHttpResponseData,
): IHttpResponse => {
  if (httpResponseData?.request) {
    log.error(
      httpResponseData?.message,
      loggerJson(httpResponseData?.request!),
    );
  }

  httpResponseData?.response?.status(401);
  return {
    statusCode: httpResponseData?.statusCode ?? 401,
    data: httpResponseData?.data,
    message: httpResponseData?.message,
  };
};

/**
 * Return a not found http response error
 * @param httpResponseData
 * @returns object with status code and message
 */
export const notFoundErrorHttpResponse = (
  httpResponseData?: IHttpResponseData,
): IHttpResponse => {
  if (httpResponseData?.request) {
    log.error(
      httpResponseData?.message,
      loggerJson(httpResponseData?.request!),
    );
  }

  httpResponseData?.response?.status(404);
  return {
    statusCode: httpResponseData?.statusCode ?? 404,
    data: httpResponseData?.data,
    message: httpResponseData?.message,
  };
};

/**
 * Return a entity validation http response error
 * @param httpResponseData
 * @returns object with status code and message
 */
export const unprocessableEntityErrorHttpResponse = (
  httpResponseData?: IHttpResponseData,
): IHttpResponse => {
  if (httpResponseData?.request) {
    log.error(
      httpResponseData?.message,
      loggerJson(httpResponseData?.request!),
    );
  }

  httpResponseData?.response?.status(422);
  return {
    statusCode: httpResponseData?.statusCode ?? 422,
    data: httpResponseData?.data,
    message: httpResponseData?.message,
  };
};

/**
 * Return a internal server http response error
 * @param httpResponseData
 * @returns object with status code and message
 */
export const internalServerErrorHttpResponse = (
  httpResponseData?: IHttpResponseData,
): IHttpResponse => {
  if (httpResponseData?.request) {
    log.error(
      httpResponseData?.message,
      loggerJson(httpResponseData?.request!),
    );
  }

  httpResponseData?.response?.status(500);
  return {
    statusCode: httpResponseData?.statusCode ?? 500,
    data: httpResponseData?.data,
    message: httpResponseData?.message,
  };
};
