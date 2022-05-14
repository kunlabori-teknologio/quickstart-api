import {Entity, hasMany, hasOne, model, property} from '@loopback/repository';
import {__Company} from './__company.model';
import {__PermissionGroup} from './__permission-group.model';
import {__Person} from './__person.model';
import {__UserHasPermissionGroups} from './__user-has-permission-groups.model';

@model()
export class __User extends Entity {
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
    name: 'email',
    description: "The user's email",
    type: 'string',
    required: false,
    jsonSchema: {
      maxLength: 50,
      errorMessage: {
        maxLength: 'Description should not exceed 50 characters.',
      },
    }
  })
  email?: string;

  @property({
    name: 'googleId',
    description: "The user's google id",
    type: 'string',
    required: false,
    jsonSchema: {
      maxLength: 30,
      errorMessage: {
        maxLength: 'Google id should not exceed 30 characters.',
      },
    }
  })
  googleId?: string;

  @property({
    name: 'appleId',
    description: "The user's apple id",
    type: 'string',
    required: false,
    jsonSchema: {
      maxLength: 30,
      errorMessage: {
        maxLength: 'Description should not exceed 30 characters.',
      },
    }
  })
  appleId?: string;

  @hasOne(() => __Person)
  person: __Person;

  @hasOne(() => __Company)
  company: __Company;

  @hasMany(() => __PermissionGroup, {through: {model: () => __UserHasPermissionGroups}})
  permissionGroups?: __PermissionGroup[];

  constructor(data?: Partial<__User>) {
    super(data);
  }
}

export interface __UserRelations {
  // describe navigational properties here
}

export type __UserWithRelations = __User & __UserRelations;
