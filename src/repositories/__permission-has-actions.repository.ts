import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {__PermissionHasActions, __PermissionHasActionsRelations} from '../models/__permission-has-actions.model';

export class __PermissionHasActionsRepository extends DefaultCrudRepository<
  __PermissionHasActions,
  typeof __PermissionHasActions.prototype._id,
  __PermissionHasActionsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(__PermissionHasActions, dataSource);
  }
}
