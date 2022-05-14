import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {PermissionHasActionsRelations, __PermissionHasActions} from '../models/__permission-has-actions.model';

export class __PermissionHasActionsRepository extends DefaultCrudRepository<
  __PermissionHasActions,
  typeof __PermissionHasActions.prototype._id,
  PermissionHasActionsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(__PermissionHasActions, dataSource);
  }
}
