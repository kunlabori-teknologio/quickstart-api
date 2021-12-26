import {Entity, model, property} from '@loopback/repository';

// SSO types enum
enum type {
  GOOGLE = 'person',
  APPLE = 'company',
}

@model()
export class Invite extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(type),
    }
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'array',
    itemType: 'any',
  })
  permissions?: any[];

  @property({
    type: 'string',
  })
  token?: string;

  @property({
    type: 'string',
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  _createdBy?: string;

  @property({
    type: 'string',
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  _ownerId?: string;

  @property({
    type: 'Date',
    default: new Date(),
  })
  _createdAt?: Date;

  constructor(data?: Partial<Invite>) {
    super(data);
  }
}

export interface InviteRelations {
  // describe navigational properties here
}

export type InviteWithRelations = Invite & InviteRelations;
