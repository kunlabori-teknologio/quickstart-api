import {Entity, model, property} from '@loopback/repository';

@model()
export class InvitationHasPermissions extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
  })
  invitationId?: string;

  @property({
    type: 'string',
  })
  permissionId?: string;

  constructor(data?: Partial<InvitationHasPermissions>) {
    super(data);
  }
}

export interface InvitationHasPermissionsRelations {
  // describe navigational properties here
}

export type InvitationHasPermissionsWithRelations = InvitationHasPermissions & InvitationHasPermissionsRelations;
