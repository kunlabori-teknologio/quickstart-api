import {model, property} from '@loopback/repository';
import {Default} from './default.model';

@model({name: 'AclAction'})
export class AclAction extends Default {
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
    name: 'name',
    description: "The ACLAction's name",
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 30,
      errorMessage: {
        maxLength: 'Name should not exceed 30 characters.',
      },
    }
  })
  name: string;

  constructor(data?: Partial<AclAction>) {
    super(data);
  }
}

export interface AclActionRelations {
  // describe navigational properties here
}

export type AclActionWithRelations = AclAction & AclActionRelations;
