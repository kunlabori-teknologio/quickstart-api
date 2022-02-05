import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {PermissionHasActions, PermissionHasActionsRelations} from '../models/permission-has-actions.model';

export class PermissionHasActionsRepository extends DefaultCrudRepository<
  PermissionHasActions,
  typeof PermissionHasActions.prototype._id,
  PermissionHasActionsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(PermissionHasActions, dataSource);
  }
}
