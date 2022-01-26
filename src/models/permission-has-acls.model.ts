import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'PermissionHasACLs'
})
export class PermissionHasAcls extends Entity {
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
  aclId?: string;

  constructor(data?: Partial<PermissionHasAcls>) {
    super(data);
  }
}

export interface PermissionHasAclsRelations {
  // describe navigational properties here
}

export type PermissionHasAclsWithRelations = PermissionHasAcls & PermissionHasAclsRelations;
