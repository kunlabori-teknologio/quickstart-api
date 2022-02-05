import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {UserHasPermissionGroups, UserHasPermissionGroupsRelations} from '../models';

export class UserHasPermissionGroupsRepository extends DefaultCrudRepository<
  UserHasPermissionGroups,
  typeof UserHasPermissionGroups.prototype._id,
  UserHasPermissionGroupsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(UserHasPermissionGroups, dataSource);
  }
}
