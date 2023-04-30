import * as mongoDB from "mongodb";
import {ObjectId} from 'mongodb';

import {RequestBodyObject, SchemaObject} from '@loopback/rest';
import {Schema} from 'mongoose';
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

export function getUserType(primaryUserInfo: IPrimaryUserInformation): UserTypesEnum {
  const type = uniqueIdLength.get(primaryUserInfo.country)?.find(el => {
    return el.length === getOnlyUniqueIdNumber(primaryUserInfo.uniqueId).length
  })?.type as UserTypesEnum

  if (!type)
    throw new Error(serverMessages.auth.uniqueIdIncorrect['pt-BR'])

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

interface ISwaggerProperties {
  [propertyName: string]: string | ISwaggerProperties | ISwaggerProperties[],
}

/**
 * Get mongoose populate object from a model schema
 * @param relatedNode
 * @param model
 * @param populate
 * @returns mongoose populate object
 */
export const getPopulateObjFromSchema = (
  relatedNode: string,
  model: any,
  populate?: any,
) => {
  let obj:any = {
    path: relatedNode,
    select: Object.keys(model).reduce((prev: string, current: string) => {
      return prev += `${current} `;
    }, '')
  }

  if(populate){
    obj.populate = getPopulateObjFromSchema(populate.relatedNode, populate.model, populate.populate);
  }

  return obj;
}

/**
 * Transform schema to mongoose model
 * @param schema
 * @returns mongoose model
 */
export const transformSchemaToMongooseModel = (
  schema: any,
) => {
  let mongooseModel: any = {};

  Object.keys(schema).forEach((key: string) => {
    if(schema[key].ref){
      mongooseModel[key] = {
        ...schema[key],
        type: Schema.Types.ObjectId,
      };
    } else {
      mongooseModel[key] = schema[key];
    }
  });

  return mongooseModel;
}

/**
 * Get ObjectId properties from a model schema
 * @param model
 * @returns array of objectId properties
 */
export const getObjectIdPropertiesFromSchema = (model: any) => {

  return (Object.keys(model) || [])
    .map((key:string) => {
      if(model[key].model) return key;
      else return null;
    })
  .filter((el: any) => el !== null);

}

/**
 * Change an key value object to an regex key value object
 * @param object
 * @param model
 * @returns regex key value object
 */
export const changeValueToRegexInKeyValue = (object: any, model?: any) => {

  let newObject: any = {}

  let objectIdProperties: any[] = []
  if(model) objectIdProperties = getObjectIdPropertiesFromSchema(model)

  Object.keys(object).forEach((key: string) => {
    if(
      typeof object[key] === 'string' &&
      !objectIdProperties.includes(key)
    )
      newObject[key] = {$regex: object[key], $options: 'i'}
    else
      newObject[key] = object[key]
  });


  return newObject;
}

/**
 * Get model schema DTO
 * @param model
 * @param data
 * @returns objct
 */
export const schemaDTO = (model: any, data: any) => {
  let dataDTO: any = {
    _id: data._id,
  };

  Object.keys(model).forEach((key: string) => {
    dataDTO[key] = data[key];
  });

  return dataDTO;
}

/**
 * Remove accent from a string
 * @param term string to remove accent
 * @returns string without accent
 */
export const removeAccent = (term: string) : string => {
  return term.normalize('NFD').replace(/[^\w\s]/gi, ' ').replace(/[\u0300-\u036f]/g, "");
}

/**
 * Get open api request body documentation object
 * @param model
 * @param deletedAttr array of attributes to delete
 * @returns open api request body object
 */
export const getSwaggerRequestBodySchema = (
  model: any,
  deletedAttr: string[],
): Partial<RequestBodyObject> => {

  const data = getSwaggerSchema(model, false, deletedAttr);

  return {
    'content': {
        'application/json': {
          'schema': data,
        }
    },
  }
}

/**
 * Get open api response documentation object
 * @param model
 * @param isArray
 * @returns open api response object
 */
export const getSwaggerResponseSchema = (
  model?: any,
  isArray?: boolean,
): SchemaObject => {

  const data = model ?
    getSwaggerSchema(
      {
        _id: {type: 'string'},
        ...model,
      },
      isArray, ['_deletedAt'], true
    ) : null;

  return {
    'content': {
        'application/json': {
          'schema': {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              data,
              message: { type: 'string' },
            }
          }
        }
    },
  }
}

/**
 * Get open api schema
 * @param model
 * @param isArray
 * @param deleteAttr array of attributes to delete
 * @param populateDeepAttr is deep populate?
 * @returns schema object
 */
const getSwaggerSchema = (
  model: any,
  isArray?: boolean,
  deleteAttr?: string[],
  populateDeepAttr?: boolean,
): SchemaObject => {

  const properties: ISwaggerProperties = transformSchemaInSwaggerObject(model, deleteAttr);

  let propertiesTyped: any = {}
  Object.keys(properties).forEach((key: string) => {
    if(typeof properties[key] === 'string'){
      propertiesTyped[key] = {type: properties[key]};
    } else if(Array.isArray(properties[key]) && properties[key].length){
      if(typeof (properties[key] as ISwaggerProperties[])[0] === 'string'){
        propertiesTyped[key] = { type: 'array', items: { type: (properties[key] as ISwaggerProperties[])[0] } };
      } else {
        const arrayProperty = (properties[key] as ISwaggerProperties[])[0];
        propertiesTyped[key] = {
          type: 'array',
          items: {
            type: 'object',
            ...getSwaggerSchema(arrayProperty),
          },
        }
      }
    } else if(
      typeof properties[key] === 'object' &&
      Object.keys(properties[key]).includes('_objectFlag')
    ) {
      propertiesTyped[key] = getSwaggerSchema(properties[key]);
      delete propertiesTyped[key]['properties']['_objectFlag']
    } else if(!populateDeepAttr){
      propertiesTyped[key] = {type: 'string'};
    } else
      propertiesTyped[key] = getSwaggerSchema(properties[key], false, ['_deletedAt'], true);
    }
  )

  return !isArray ?
    {
      type: 'object',
      properties: propertiesTyped
    } :
    {
      type: 'object',
      properties: {
        result: {
          type: 'array',
          items: {
            type: 'object',
            properties: propertiesTyped,
          }
        },
        total: { type: 'number' },
        page: { type: 'number' },
      }
    }
}

/**
 * Get an open api object from a model schema
 * @param model
 * @param deleteAttr array of attributes to delete
 * @returns open api object
 */
const transformSchemaInSwaggerObject = (
  model: any,
  deleteAttr?: string[],
): ISwaggerProperties => {
  let obj:ISwaggerProperties = {};

  deleteAttr = deleteAttr ?? [];

  Object.keys(model).forEach((key: string) => {
    let type;

    if(Array.isArray(model[key])){
      if(typeof model[key][0] === 'string') type = [model[key][0]];
      else type = [transformSchemaInSwaggerObject(model[key][0])];
    } else if(model[key]['type'] === 'object' && Object.keys(model[key]['properties']).length){
      type = transformSchemaInSwaggerObject({...model[key]['properties'], _objectFlag: { type: 'string' }});
    } else {
      type = model[key]['model'] ?? model[key]['type'];
    }

    if(!deleteAttr?.includes(key))
      obj[key] = type;
  })

  return obj;
}
