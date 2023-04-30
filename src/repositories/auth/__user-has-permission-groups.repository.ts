import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AuthMongodbDataSource} from '../../datasources';
import {
  __UserHasPermissionGroups,
  __UserHasPermissionGroupsRelations
} from '../../models';

export class __UserHasPermissionGroupsRepository extends DefaultCrudRepository<
  __UserHasPermissionGroups,
  typeof __UserHasPermissionGroups.prototype._id,
  __UserHasPermissionGroupsRelations
> {
  constructor(@inject('datasources.auth_mongodb') dataSource: AuthMongodbDataSource) {
    super(__UserHasPermissionGroups, dataSource);
  }
}
