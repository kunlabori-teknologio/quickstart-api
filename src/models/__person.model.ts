import {Entity, model, property} from '@loopback/repository';

@model()
export class __Person extends Entity {
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
    required: true,
  })
  uniqueId: string;

  @property({
    type: 'Date',
    required: true,
  })
  birthday: Date;

  @property({
    type: 'string',
    required: true,
  })
  gender: string;

  @property({
    type: 'string',
    required: true,
  })
  mother: string;

  @property({
    type: 'string',
    required: true,
  })
  country: string;

  @property({
    type: 'string',
  })
  username?: string;

  @property({
    type: 'string'
  })
  nickname?: string

  @property({
    type: 'string'
  })
  genderIdentity?: string

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<__Person>) {
    super(data);
  }
}

export interface __PersonRelations {
  // describe navigational properties here
}

export type __PersonWithRelations = __Person & __PersonRelations;
