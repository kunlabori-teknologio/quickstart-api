import {Entity, model, property} from '@loopback/repository';

@model()
export class Default extends Entity {

  @property({
    type: 'string',
    hidden: true,
  })
  _createdBy?: string;

  @property({
    type: 'date',
    hidden: true,
    defaultFn: 'now',
  })
  _createdAt?: Date;

  @property({
    hidden: true,
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
