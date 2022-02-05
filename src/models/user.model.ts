import {Entity, hasMany, hasOne, model, property} from '@loopback/repository';
import {Company} from './company.model';
import {PermissionGroup} from './permission-group.model';
import {Person} from './person.model';
import {UserHasPermissionGroups} from './user-has-permission-groups.model';

@model()
export class User extends Entity {
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

  @hasOne(() => Person)
  person: Person;

  @hasOne(() => Company)
  company: Company;

  @hasMany(() => PermissionGroup, {through: {model: () => UserHasPermissionGroups}})
  permissionGroups?: PermissionGroup[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
