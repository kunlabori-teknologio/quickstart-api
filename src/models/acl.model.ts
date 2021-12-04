import {Entity, Model, model, property} from '@loopback/repository';

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
export class Acl extends Entity {
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

  // @property({
  //   type: 'string',
  //   mongodb: {
  //     dataType: 'ObjectId'
  //   },
  // })
  // _createdBy?: string;

  // @property({
  //   type: 'string',
  //   mongodb: {
  //     dataType: 'ObjectId'
  //   },
  // })
  // _ownerBy?: string;


  constructor(data?: Partial<Acl>) {
    super(data);
  }
}

export interface AclRelations {
  // describe navigational properties here
}

export type AclWithRelations = Acl & AclRelations;
