import {model, property} from '@loopback/repository';
import {__Default} from '../';

@model()
export class __Module extends __Default {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    name: 'name',
    description: "The Module's name",
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
    description: "The Module's description",
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
    name: 'route',
    description: "The Module's route",
    type: 'string',
    required: false,
  })
  route?: string;

  @property({
    name: 'collection',
    description: "The Module's collection",
    type: 'string',
    required: false,
  })
  collection?: string;

  @property({
    name: 'project',
    description: "The Project that this module is in",
    type: 'string',
    required: true,
  })
  project: string;

  @property({
    name: 'icon',
    description: "The Module's icon",
    type: 'string',
    required: false,
  })
  icon?: string;

  constructor(data?: Partial<__Module>) {
    super(data);
  }
}

export interface __ModuleRelations {
  // describe navigational properties here
}

export type __ModuleWithRelations = __Module & __ModuleRelations;
