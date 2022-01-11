import {Model, model, property} from '@loopback/repository';
import {Default} from './default.model';

// ACL schema model
@model()
class ACLSchema extends Model {
  @property({
    required: true,
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  module: string;

  @property({
    type: 'array',
    itemType: 'string',
    default: [],
  })
  aclActions: string[];
}

@model()
export class Permission extends Default {
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
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  users?: string[];

  @property({
    type: 'array',
    itemType: 'any',
    required: true,
  })
  acl: ACLSchema[];

  constructor(data?: Partial<Permission>) {
    super(data);
  }
}

export interface PermissionRelations {
  // describe navigational properties here
}

export type PermissionWithRelations = Permission & PermissionRelations;
