import {Model, model, property} from '@loopback/repository';
import {Default} from './default.model';

// Permission schema model
@model()
class PermissionSchema extends Model {
  @property({
    required: true,
    mongodb: {
      dataType: 'ObjectId'
    },
  })
  moduleId: string;

  @property({
    type: 'array',
    itemType: 'string',
    default: [],
  })
  actions: string[];
}

@model({name: 'ACL'})
export class Acl extends Default {
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
    type: 'array',
    itemType: PermissionSchema,
    default: [],
  })
  permissions?: PermissionSchema[];

  constructor(data?: Partial<Acl>) {
    super(data);
  }
}

export interface AclRelations {
  // describe navigational properties here
}

export type AclWithRelations = Acl & AclRelations;
