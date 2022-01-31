import {Response} from '@loopback/rest';
import {localeMessage, serverMessages} from './server-messages';
/**
 * Http ok response
 * @param response Response
 * @param message string
 * @param data any
 * @param internalCode string
 * @returns Http reponse interface
 */
export function ok(
  {response, message, data, internalCode}:
    {response: Response, message?: string, data?: any, internalCode?: string}
): void {
  response.status(200);
  response.send({
    internalCode: internalCode || '200',
    message: message || serverMessages['httpResponse']['ok'][localeMessage],
    data: data || {},
  });
}
/**
 * Http bad request error response
 * @param response Response
 * @param message string
 * @param data any
 * @param internalCode string
 */
export function badRequestError(
  {response, message, data, internalCode, logMessage}:
    {response: Response, message?: string, data?: any, internalCode?: string, logMessage?: string}
): void {
  response.status(400);
  response.send({
    internalCode: internalCode || '400',
    message: message || serverMessages['httpResponse']['badRequestError'][localeMessage],
    data
  });
};
/**
 * Http not found error response
 * @param response Response
 * @param message string
 * @param data any
 * @param internalCode string
 */
export function notFoundError(
  {response, message, data, internalCode}:
    {response: Response, message?: string, data?: any, internalCode?: string}
): void {
  response.status(404);
  response.send({
    internalCode: internalCode || '404',
    message: message || serverMessages['httpResponse']['notFoundError'][localeMessage],
    data
  });
};
/**
 * Http unauthorized error response
 * @param response Response
 * @param message string
 * @param data any
 * @param internalCode string
 */
export function unauthorizedError(
  {response, message, data, internalCode}:
    {response: Response, message?: string, data?: any, internalCode?: string}
): void {
  response.status(401);
  response.send({
    internalCode: internalCode || '401',
    message: message || serverMessages['httpResponse']['unauthorizedError'][localeMessage],
    data
  });
};
/**
 * Http internal server error response
 * @param response Response
 * @param message string
 * @param data any
 * @param internalCode string
 */
export function internalServerError(
  {response, message, data, internalCode}:
    {response: Response, message?: string, data?: any, internalCode?: string}
): void {
  response.status(500);
  response.send({
    internalCode: internalCode || '500',
    message: message || serverMessages['httpResponse']['internalServerError'][localeMessage],
    data
  });
};
