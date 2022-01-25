import {model, property} from '@loopback/repository';
import {Default} from '.';

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

  @property({
    name: 'permissions',
    description: "The permissions array",
    type: 'array',
    itemType: 'string',
    required: true,
  })
  permissions: string[];


  constructor(data?: Partial<Invitation>) {
    super(data);
  }
}

export interface InvitationRelations {
  // describe navigational properties here
}

export type InvitationWithRelations = Invitation & InvitationRelations;
