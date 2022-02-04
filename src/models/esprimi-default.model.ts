import {model, property} from '@loopback/repository';
import {Default} from '.';

@model()
export class EsprimiDefault extends Default {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  // End properties
  constructor(data?: Partial<EsprimiDefault>) {
    super(data);
  }
}

export interface EsprimiDefaultRelations {
  // describe navigational properties here
}

export type EsprimiDefaultWithRelations = EsprimiDefault & EsprimiDefaultRelations;
