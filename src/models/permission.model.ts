import {model, property} from '@loopback/repository';
import {getJsonSchema} from '@loopback/rest';
import {Acl} from './acl.model';
import {Default} from './default.model';

@model()
export class Permission extends Default {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  _id?: string;

  @property({
    name: 'name',
    description: "The permission's name",
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 30,
      errorMessage: {
        maxLength: 'Name should not exceed 30 characters.',
      },
    }
  })
  name: string;

  @property({
    name: 'description',
    description: "The permission's description",
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 50,
      errorMessage: {
        maxLength: 'Description should not exceed 50 characters.',
      },
    }
  })
  description: string;

  @property({
    name: 'users',
    description: "The users that have the permission",
    type: 'array',
    itemType: 'string',
    required: false,
  })
  users?: string[];

  @property({
    name: 'acl',
    description: "The acls related to the permission",
    type: 'array',
    itemType: 'any',
    required: true,
    jsonSchema: getJsonSchema(Acl),
  })
  acl: Acl[];

  constructor(data?: Partial<Permission>) {
    super(data);
  }
}

export interface PermissionRelations {
  // describe navigational properties here
}

export type PermissionWithRelations = Permission & PermissionRelations;
