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
/**
 * Create filter params to http request
 * @param limit number
 * @param page number
 * @param orderBy number
 * @returns
 */
export function createFilterRequestParams(urlString: string): any {
  /**
   * Get params from url
   */
  const url = new URL(`${process.env.SERVER_ROOT_URI}${urlString}`).searchParams;
  /**
   * Create where conditions
   */
  let where: any[] = [];
  url.forEach((value, key) => {
    if (!['limit', 'page', 'order_by'].includes(key)) {
      var pattern = new RegExp('.*' + value + '.*', "i");
      where.push({[key]: {like: pattern}});
    }
  })
  /**
   * Return filter options
   */
  const filters = {
    limit: (url.get('limit') ?? 100) as number,
    skip: ((url.get('limit') ?? 100) as number) * ((url.get('page') ?? 0) as number),
    order: [(url.get('order_by') || '')],
    where: where.length ? {'and': where} : {},
  };
  return filters;
}
