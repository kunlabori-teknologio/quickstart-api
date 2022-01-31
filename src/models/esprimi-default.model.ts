import {Entity, model, property} from '@loopback/repository';

@model()
export class EsprimiDefault extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
  })
  string?: string;

  @property({
    type: 'number',
  })
  number?: number;

  @property({
    type: 'boolean',
  })
  boolean?: boolean;

  @property({
    type: 'array',
    itemType: 'any',
  })
  array?: any[];

  @property({
    type: 'date',
  })
  date?: string;

  @property({
    type: 'any',
  })
  any?: any;


  constructor(data?: Partial<EsprimiDefault>) {
    super(data);
  }
}

export interface EsprimiDefaultRelations {
  // describe navigational properties here
}

export type EsprimiDefaultWithRelations = EsprimiDefault & EsprimiDefaultRelations;
