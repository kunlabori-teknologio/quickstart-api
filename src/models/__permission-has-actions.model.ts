import {Entity, model, property} from '@loopback/repository';

@model()
export class __PermissionHasActions extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
  })
  permissionId?: string;

  @property({
    type: 'string',
  })
  permissionActionId?: string;

  constructor(data?: Partial<__PermissionHasActions>) {
    super(data);
  }
}

export interface __PermissionHasActionsRelations {
  // describe navigational properties here
}

export type __PermissionHasActionsWithRelations = __PermissionHasActions & __PermissionHasActionsRelations;
