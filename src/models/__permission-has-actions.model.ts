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

export interface PermissionHasActionsRelations {
  // describe navigational properties here
}

export type PermissionHasActionsWithRelations = __PermissionHasActions & PermissionHasActionsRelations;
