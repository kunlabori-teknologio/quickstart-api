import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {Default} from './default.model';
import {Module} from './module.model';
import {PermissionAction} from './permission-action.model';
import {PermissionHasActions} from './permission-has-actions.model';

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
  @hasMany(() => PermissionAction, {through: {model: () => PermissionHasActions}})
  permissionActions: PermissionAction[];

  @belongsTo(() => Module)
  moduleId: string;

  @property({
    type: 'string',
  })
  permissionGroupId?: string;

  module?: Module;

  constructor(data?: Partial<Permission>) {
    super(data);
  }
}

export interface PermissionRelations {
  // describe navigational properties here
}

export type PermissionWithRelations = Permission & PermissionRelations;
