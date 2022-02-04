import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {UserHasPermissions, UserHasPermissionsRelations} from '../models';

export class UserHasPermissionsRepository extends DefaultCrudRepository<
  UserHasPermissions,
  typeof UserHasPermissions.prototype._id,
  UserHasPermissionsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(UserHasPermissions, dataSource);
  }
}
