import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {__Default} from '../__default.model';
import {__Module} from './__module.model';
import {__PermissionAction} from './__permission-action.model';
import {__PermissionHasActions} from './__permission-has-actions.model';

@model()
export class __Permission extends __Default {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  _id?: string;
  @hasMany(() => __PermissionAction, {through: {model: () => __PermissionHasActions}})
  permissionActions: __PermissionAction[];

  @belongsTo(() => __Module)
  moduleId: string;

  @property({
    type: 'string',
  })
  permissionGroupId?: string;

  module?: __Module;

  constructor(data?: Partial<__Permission>) {
    super(data);
  }
}

export interface __PermissionRelations {
  // describe navigational properties here
}

export type __PermissionWithRelations = __Permission & __PermissionRelations;
