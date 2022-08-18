import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AuthMongodbDataSource} from '../datasources';
import {__PermissionAction, __PermissionActionRelations} from '../models';

export class __PermissionActionRepository extends DefaultCrudRepository<
  __PermissionAction,
  typeof __PermissionAction.prototype._id,
  __PermissionActionRelations
> {
  constructor(
    @inject('datasources.auth_mongodb') dataSource: AuthMongodbDataSource,
  ) {
    super(__PermissionAction, dataSource);
  }
}
