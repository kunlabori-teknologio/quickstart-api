import {Entity, model, property} from '@loopback/repository';

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
    type: 'string',
    ongodb: {
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
