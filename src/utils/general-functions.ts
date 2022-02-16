import {LocaleEnum} from '../enums/locale.enum';
import {serverMessages} from './server-messages';

export enum UserTypesEnum {
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
      {type: UserTypesEnum.person, length: 11},
      {type: UserTypesEnum.company, length: 14}
    ]
  ]
])

export function getUserType(primaryUserInfo: IPrimaryUserInformation, locale?: LocaleEnum): UserTypesEnum {
  const type = uniqueIdLength.get(primaryUserInfo.country)?.find(el => {
    return el.length === getOnlyUniqueIdNumber(primaryUserInfo.uniqueId).length
  })?.type as UserTypesEnum

  if (!type)
    throw new Error(serverMessages['auth']['uniqueIdIncorrect'][locale ?? LocaleEnum['pt-BR']])

  return type
}

function getOnlyUniqueIdNumber(uniqueId: string): string {
  return uniqueId.replace(/[^a-zA-Z0-9]/g, '')
}

export const getAclActionsFromHttpMethod: Map<String, string[]> = new Map([
  ['GET', ['read', 'readOne']],
  ['POST', ['create', 'createOne']],
  ['PUT', ['update', 'updateOne']],
  ['PATCH', ['update', 'updateOne']],
  ['DELETE', ['delete', 'deleteOne']],
])
