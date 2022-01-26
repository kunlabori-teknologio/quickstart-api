import {model, property, hasMany} from '@loopback/repository';
import {Default} from '.';
import {Permission} from './permission.model';
import {InvitationHasPermissions} from './invitation-has-permissions.model';

@model()
export class Invitation extends Default {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  _id?: string;

  @property({
    name: 'inviterId',
    description: "The inviter userId",
    type: 'string',
    required: true,
  })
  inviterId: string;

  @hasMany(() => Permission, {through: {model: () => InvitationHasPermissions}})
  permissions: Permission[];

  constructor(data?: Partial<Invitation>) {
    super(data);
  }
}

export interface InvitationRelations {
  // describe navigational properties here
}

export type InvitationWithRelations = Invitation & InvitationRelations;
