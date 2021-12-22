import {Entity, model, property} from '@loopback/repository';

@model({name: 'AclAction'})
export class AclAction extends Entity {
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

  constructor(data?: Partial<AclAction>) {
    super(data);
  }
}

export interface AclActionRelations {
  // describe navigational properties here
}

export type AclActionWithRelations = AclAction & AclActionRelations;
