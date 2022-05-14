import {hasMany, model, property} from '@loopback/repository';
import {__Default} from './__default.model';
import {__Permission} from './__permission.model';

@model()
export class __PermissionGroup extends __Default {
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
    description: "The permission group's name",
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

  // @property({
  //   type: 'string',
  // })
  // projectId?: string;

  @property({
    name: 'isAdminPermission',
    description: 'Define if is an admin permission used in login without invite',
    type: 'boolean',
    required: false,
    default: false,
  })
  isAdminPermission?: boolean;

  @hasMany(() => __Permission)
  permissions: __Permission[];

  @property()
  owner?: {};

  constructor(data?: Partial<__PermissionGroup>) {
    super(data);
  }
}

export interface __PermissionGroupRelations {
  // describe navigational properties here
}

export type __PermissionGroupWithRelations = __PermissionGroup & __PermissionGroupRelations;
