import {model, property, hasMany} from '@loopback/repository';
import {Default} from '.';
import {PermissionGroup} from './permission-group.model';
import {Module} from './module.model';

@model()
export class Project extends Default {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    name: "name",
    description: "The Project's name",
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
    name: "description",
    description: "The Project's description",
    type: 'string',
    required: false,
    jsonSchema: {
      maxLength: 50,
      errorMessage: {
        maxLength: 'Name should not exceed 50 characters.',
      },
    }
  })
  description?: string;

  @hasMany(() => PermissionGroup)
  permissionGroups: PermissionGroup[];

  @hasMany(() => Module)
  modules: Module[];

  constructor(data?: Partial<Project>) {
    super(data);
  }
}

export interface ProjectRelations {
  // describe navigational properties here
}

export type ProjectWithRelations = Project & ProjectRelations;
