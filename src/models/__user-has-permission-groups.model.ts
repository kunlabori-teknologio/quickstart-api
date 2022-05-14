import {Entity, model, property} from '@loopback/repository';

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

  constructor(data?: Partial<__UserHasPermissionGroups>) {
    super(data);
  }
}

export interface UserHasPermissionGroupsRelations {
  // describe navigational properties here
}

export type UserHasPermissionGroupsWithRelations = __UserHasPermissionGroups & UserHasPermissionGroupsRelations;
