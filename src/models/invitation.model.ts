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
    type: 'string',
  })
  type?: string;

  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'array',
    itemType: 'any',
  })
  permissions?: any[];


  constructor(data?: Partial<Invitation>) {
    super(data);
  }
}

export interface InvitationRelations {
  // describe navigational properties here
}

export type InvitationWithRelations = Invitation & InvitationRelations;
