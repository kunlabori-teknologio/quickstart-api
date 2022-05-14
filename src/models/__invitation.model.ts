import {belongsTo, model, property} from '@loopback/repository';
import {__Default} from '.';
import {__PermissionGroup} from './__permission-group.model';

@model()
export class __Invitation extends __Default {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @belongsTo(() => __PermissionGroup)
  permissionGroupId: string;

  constructor(data?: Partial<__Invitation>) {
    super(data);
  }
}

export interface InvitationRelations {
  // describe navigational properties here
}

export type InvitationWithRelations = __Invitation & InvitationRelations;
