import {Model, model, property} from '@loopback/repository';

// Signup schema model
@model()
export class Signup extends Model {
  @property({
    required: true,
    description: 'Person/Company Unique ID such as CPF and CNPJ',
  })
  uniqueId: string;

  @property({
    required: true,
  })
  birthday: Date;
}
