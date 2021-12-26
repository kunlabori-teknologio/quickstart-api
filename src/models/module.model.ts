import {Entity, model, property} from '@loopback/repository';

@model()
export class Module extends Entity {
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
  })
  description?: string;

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
  _ownerBy?: string;

  @property({
    type: 'Date',
    default: new Date(),
  })
  _createdAt?: Date;


  constructor(data?: Partial<Module>) {
    super(data);
  }
}

export interface ModuleRelations {
  // describe navigational properties here
}

export type ModuleWithRelations = Module & ModuleRelations;
