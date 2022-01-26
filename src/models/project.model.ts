import {model, property, hasMany} from '@loopback/repository';
import {Default} from './default.model';
import {Permission} from './permission.model';

@model()
export class Project extends Default {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    name: 'name',
    description: "The project's name",
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
    description: "The project's description",
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

  @property({
    name: 'secret',
    description: "The project's secret",
    type: 'string',
    required: false,
    defaultFn: 'uuidv4',
  })
  secret?: string;

  @hasMany(() => Permission)
  permissions: Permission[];

  constructor(data?: Partial<Project>) {
    super(data);
  }
}

export interface ProjectRelations {
  // describe navigational properties here
}

export type ProjectWithRelations = Project & ProjectRelations;
