import {model, property, hasMany} from '@loopback/repository';
import {Default} from './default.model';
import {Acl} from './acl.model';
import {PermissionHasAcls} from './permission-has-acls.model';

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

  @hasMany(() => Acl, {through: {model: () => PermissionHasAcls}})
  acls: Acl[];

  constructor(data?: Partial<Permission>) {
    super(data);
  }
}

export interface PermissionRelations {
  // describe navigational properties here
}

export type PermissionWithRelations = Permission & PermissionRelations;
