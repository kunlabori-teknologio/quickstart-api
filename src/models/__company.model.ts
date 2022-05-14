import {Entity, model, property} from '@loopback/repository';
import {IBusinessActivityCode} from '../interfaces/company.interface';

@model()
export class __Company extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  corporateName: string;

  @property({
    type: 'string',
    required: false,
  })
  tradeName?: string;

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
    required: false,
  })
  email?: string;

  @property({
    type: 'string',
    required: true,
  })
  responsible: string;

  @property({
    type: 'any',
    required: true,
  })
  businessActivityCode: IBusinessActivityCode[];

  @property({
    type: 'string',
  })
  userId?: string;

  constructor(data?: Partial<__Company>) {
    super(data);
  }
}

export interface CompanyRelations {
  // describe navigational properties here
}

export type CompanyWithRelations = __Company & CompanyRelations;
