import {model, property, hasMany} from '@loopback/repository';
import {Default} from './default.model';
import {AclAction} from './acl-action.model';
import {AclHasActions} from './acl-has-actions.model';

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
    name: 'name',
    description: "The ACL's name",
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 30,
      errorMessage: {
        maxLength: 'Name should not exceed 30 characters.',
      },
    }
  })
  name: string;

  @property({
    type: 'string',
  })
  module?: string;

  @hasMany(() => AclAction, {through: {model: () => AclHasActions}})
  aclActions: AclAction[];

  constructor(data?: Partial<Acl>) {
    super(data);
  }
}

export interface AclRelations {
  // describe navigational properties here
}

export type AclWithRelations = Acl & AclRelations;
