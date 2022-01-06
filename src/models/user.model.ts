import {Entity, Model, model, property} from '@loopback/repository';

// ACL schema model
@model()
class InviteSchema extends Model {
  @property({
    required: true,
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  inviterId: string;

  @property({
    required: true,
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  projectId: string;

  @property({
    required: true,
    type: 'Date'
  })
  invitedAt: Date;

}

@model()
export class User extends Entity {
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
  email?: string;

  @property({
    type: 'string',
  })
  googleId?: string;

  @property({
    type: 'string',
  })
  appleId?: string;

  @property({
    type: 'string',
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  personId?: string;

  @property({
    type: 'string',
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  companyId?: string;

  @property({
    type: 'array',
    itemType: 'object',
    default: [],
  })
  projects: any[];

  @property({
    type: 'array',
    itemType: 'any',
    default: [],
  })
  inviters?: InviteSchema[];

  @property({
    type: 'string',
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  acl?: string;


  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
