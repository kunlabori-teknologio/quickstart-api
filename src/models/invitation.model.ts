import {hasMany, model, property} from '@loopback/repository';
import {Default} from '.';
import {InvitationHasPermissions} from './invitation-has-permissions.model';
import {Permission} from './permission.model';

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
