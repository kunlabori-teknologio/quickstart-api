import * as mongoDB from "mongodb";
import {ObjectId} from 'mongodb';

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

export function getOnlyUniqueIdNumber(uniqueId: string): string {
  return uniqueId.replace(/[^a-zA-Z0-9]/g, '')
}

export const getAclActionsFromHttpMethod: Map<String, string[]> = new Map([
  ['GET', ['read', 'readOne']],
  ['POST', ['create', 'createOne']],
  ['PUT', ['update', 'updateOne']],
  ['PATCH', ['update', 'updateOne']],
  ['DELETE', ['delete', 'deleteOne']],
])

export async function getRelatedElements(collection: string, ids?: any[]): Promise<any[]> {
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGO_URL!);

  await client.connect()

  const relatedData = await client
    .db(process.env.DB)
    .collection(collection)
    .find({
      _id: {"$in": (ids || []).flat().map(id => new ObjectId(id))}
    })
    .toArray()

  await client.close()

  return relatedData
}

export async function getRelatedElement(collection: string, id?: String): Promise<any> {
  if (!id) return null;

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGO_URL!);

  await client.connect()

  const relatedData = await client
    .db(process.env.DB)
    .collection(collection)
    .findOne({_id: id})

  await client.close()

  return relatedData
}

export function removeObjAttr(object: any, attrArray?: string[]): any {
  if(!attrArray || !attrArray.length) return object

  const attrs = Object.keys(object);

  for (let attrIndex = 0; attrIndex < attrs.length; attrIndex++) {
    const attr = attrs[attrIndex];

    if(attrArray.includes(attr)){

      delete object[attr]

    } else if(Array.isArray(object[attr])){

      object[attr] = object[attr].map((obj: any) => {
        if(typeof obj === 'object') return removeObjAttr(obj, attrArray)
        return obj
      }).filter((obj:any) => {
        if(typeof obj === 'object') return Object.keys(obj).length !== 0
        return obj
      })

    } else if(typeof object[attr] === 'object'){

      object[attr] = removeObjAttr(object[attr], attrArray)

    }
  }

  return object;
}
