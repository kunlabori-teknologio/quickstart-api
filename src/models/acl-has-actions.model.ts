import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'ACLHasActions'
})
export class AclHasActions extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
  })
  aclId?: string;

  @property({
    type: 'string',
  })
  aclActionId?: string;

  constructor(data?: Partial<AclHasActions>) {
    super(data);
  }
}

export interface AclHasActionsRelations {
  // describe navigational properties here
}

export type AclHasActionsWithRelations = AclHasActions & AclHasActionsRelations;
