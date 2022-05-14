import {Entity, model, property} from '@loopback/repository';

@model()
export class __Default extends Entity {

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
    defaultFn: null,
    default: null,
    hidden: true,
  })
  _deletedAt?: string | null | Date;

  @property({
    hidden: true,
    type: 'string',
  })
  _ownerId?: string;


  constructor(data?: Partial<__Default>) {
    super(data);
  }
}

export interface __DefaultRelations {
  // describe navigational properties here
}

export type __DefaultWithRelations = __Default & __DefaultRelations;
