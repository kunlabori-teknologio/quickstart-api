import {belongsTo, model, property} from '@loopback/repository';
import {Default} from '.';
import {PermissionGroup} from './permission-group.model';

@model()
export class Invitation extends Default {
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

  @belongsTo(() => PermissionGroup)
  permissionGroupId: string;

  constructor(data?: Partial<Invitation>) {
    super(data);
  }
}

export interface InvitationRelations {
  // describe navigational properties here
}

export type InvitationWithRelations = Invitation & InvitationRelations;
