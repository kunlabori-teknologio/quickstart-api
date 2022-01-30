import {Response} from '@loopback/rest';
import {IncomingHttpHeaders} from 'http';
import {unauthorizedError} from './http-response';
import {localeMessage, serverMessages} from './server-messages';

// Usertypes
export enum userTypes {
  person = 'person',
  company = 'company',
}
// Unique id type and length interface
interface UniqueIdTypeLength {
  type: string,
  length: number,
}
// Length of unique id by county
const uniqueIdLength: Map<String, UniqueIdTypeLength[]> = new Map([
  ['br', [{type: userTypes.person, length: 11}, {type: userTypes.company, length: 14},]]
]);
/**
 * Check if unique belongs a person or a company
 * @param uniqueId
 * @param country ex.: 'br'
 * @returns 'person' or 'company'
 */
export function getUserType(
  {uniqueId, country}: {uniqueId: string, country: string}
): userTypes {
  const uniqueIdOnlyNumber: string = uniqueId.replace(/[^a-zA-Z0-9]/g, '');
  const uniqueIdNumberCount: number = uniqueIdOnlyNumber.length;
  const type = uniqueIdLength.get(country)?.find(el => el.length === uniqueIdNumberCount)?.type as userTypes;
  if (!type) throw new Error(serverMessages['auth']['uniqueIdIncorrect'][localeMessage]);
  return type;
}

export function getAuthTokenFromHeader(
  headers: IncomingHttpHeaders, response: Response
) {
  let authToken = headers.authorization!;
  if (!authToken) unauthorizedError({response});
  return authToken.split(' ')[1];
}

export function excludeDefaultParamsFromSchema(): any[] {
  return ['_createdAt', '_createdBy', '_id', '_ownerId'];
}
