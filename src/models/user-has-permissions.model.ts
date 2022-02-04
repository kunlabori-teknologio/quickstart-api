import {Entity, model, property} from '@loopback/repository';

@model()
export class UserHasPermissions extends Entity {
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
  permissionId?: string;

  constructor(data?: Partial<UserHasPermissions>) {
    super(data);
  }
}

export interface UserHasPermissionsRelations {
  // describe navigational properties here
}

export type UserHasPermissionsWithRelations = UserHasPermissions & UserHasPermissionsRelations;
