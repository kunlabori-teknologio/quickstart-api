import {Model, model, property} from '@loopback/repository';

@model({name: 'ACL'})
export class Acl extends Model {
  @property({
    name: 'module',
    description: "The module's id",
    required: true,
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  module: string;

  @property({
    name: 'aclActions',
    description: "Array of the ACLAction ids",
    type: 'array',
    itemType: 'string',
    default: [],
  })
  aclActions: string[];

  constructor(data?: Partial<Acl>) {
    super(data);
  }
}

export interface AclRelations {
  // describe navigational properties here
}

export type AclWithRelations = Acl & AclRelations;
