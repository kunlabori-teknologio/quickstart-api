import {model, property} from '@loopback/repository';
import {Default} from '.';

@model()
export class Invite extends Default {
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


  constructor(data?: Partial<Invite>) {
    super(data);
  }
}

export interface InviteRelations {
  // describe navigational properties here
}

export type InviteWithRelations = Invite & InviteRelations;
