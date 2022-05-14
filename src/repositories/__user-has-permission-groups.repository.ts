import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {UserHasPermissionGroupsRelations, __UserHasPermissionGroups} from '../models';

export class __UserHasPermissionGroupsRepository extends DefaultCrudRepository<
  __UserHasPermissionGroups,
  typeof __UserHasPermissionGroups.prototype._id,
  UserHasPermissionGroupsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(__UserHasPermissionGroups, dataSource);
  }
}
