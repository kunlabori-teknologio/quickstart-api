import {Response} from '@loopback/rest';
import {IncomingHttpHeaders} from 'http';
import {HttpClass} from './../classes/http.class';
import {localeMessage, serverMessages} from './server-messages';

export enum userTypesEnum {
  person = 'person',
  company = 'company',
}

interface IUniqueIdInfos {
  type: string,
  length: number,
}

interface IPrimaryUserInformation {
  uniqueId: string,
  country: string,
}

const uniqueIdLength: Map<String, IUniqueIdInfos[]> = new Map([
  ['br',
    [
      {type: userTypesEnum.person, length: 11},
      {type: userTypesEnum.company, length: 14}
    ]
  ]
])

export function getUserType(primaryUserInfo: IPrimaryUserInformation): userTypesEnum {
  const type = uniqueIdLength.get(primaryUserInfo.country)?.find(el => {
    return el.length === getOnlyUniqueIdNumber(primaryUserInfo.uniqueId).length
  })?.type as userTypesEnum

  if (!type)
    throw new Error(serverMessages['auth']['uniqueIdIncorrect'][localeMessage])

  return type
}

function getOnlyUniqueIdNumber(uniqueId: string): string {
  return uniqueId.replace(/[^a-zA-Z0-9]/g, '')
}

interface IHeaderAndResponse {
  headers: IncomingHttpHeaders,
  response: Response
}

export function getAuthTokenFromHeader(headerAndResponse: IHeaderAndResponse) {
  let authToken = headerAndResponse.headers.authorization!
  if (!authToken)
    new HttpClass({response: headerAndResponse.response}).unauthorizedErrorResponse()
  return authToken.split(' ')[1]
}

export const getAclActionsFromHttpMethod: Map<String, string[]> = new Map([
  ['GET', ['read', 'readOne']],
  ['POST', ['create', 'createOne']],
  ['PUT', ['update', 'updateOne']],
  ['PATCH', ['update', 'updateOne']],
  ['DELETE', ['delete', 'deleteOne']],
])
