import {hasMany, model, property} from '@loopback/repository';
import {Default} from './default.model';
import {Permission} from './permission.model';

@model()
export class PermissionGroup extends Default {
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
    description: "The permission group's name",
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
    description: "The permission's description",
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 50,
      errorMessage: {
        maxLength: 'Description should not exceed 50 characters.',
      },
    }
  })
  description: string;

  @property({
    type: 'string',
  })
  projectId?: string;

  @hasMany(() => Permission)
  permissions: Permission[];

  constructor(data?: Partial<PermissionGroup>) {
    super(data);
  }
}

export interface PermissionGroupRelations {
  // describe navigational properties here
}

export type PermissionGroupWithRelations = PermissionGroup & PermissionGroupRelations;
