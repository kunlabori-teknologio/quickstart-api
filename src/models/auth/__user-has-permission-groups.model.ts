import { Entity, model, property } from '@loopback/repository';

@model()
export class __UserHasPermissionGroups extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
  })
  userId?: string;

  @property({
    type: 'string',
  })
  permissionGroupId?: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
  })
  isUserDisabled?: boolean;

  constructor(data?: Partial<__UserHasPermissionGroups>) {
    super(data);
  }
}

export interface __UserHasPermissionGroupsRelations {
  // describe navigational properties here
}

export type __UserHasPermissionGroupsWithRelations = __UserHasPermissionGroups & __UserHasPermissionGroupsRelations;
