import {Entity, model, property} from '@loopback/repository';

@model()
export class Default extends Entity {

  @property({
    type: 'string',
  })
  _createdBy?: string;

  @property({
    type: 'date',
    default: new Date(),
  })
  _createdAt?: Date;

  @property({
    type: 'string',
  })
  _ownerId?: string;


  constructor(data?: Partial<Default>) {
    super(data);
  }
}

export interface DefaultRelations {
  // describe navigational properties here
}

export type DefaultWithRelations = Default & DefaultRelations;
