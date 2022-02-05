import {model, property} from '@loopback/repository';
import {Default} from './default.model';

@model({name: 'PermissionAction'})
export class PermissionAction extends Default {
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
    description: "The PermissionAction's name",
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

  @property({
    name: 'description',
    description: "The PermissionAction's description",
    type: 'string',
    required: false,
    jsonSchema: {
      maxLength: 50,
      errorMessage: {
        maxLength: 'Description should not exceed 50 characters.',
      },
    }
  })
  description?: string;

  constructor(data?: Partial<PermissionAction>) {
    super(data);
  }
}

export interface PermissionActionRelations {
  // describe navigational properties here
}

export type PermissionActionWithRelations = PermissionAction & PermissionActionRelations;
