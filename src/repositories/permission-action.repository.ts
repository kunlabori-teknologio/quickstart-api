import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {PermissionAction, PermissionActionRelations} from '../models';

export class PermissionActionRepository extends DefaultCrudRepository<
  PermissionAction,
  typeof PermissionAction.prototype._id,
  PermissionActionRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(PermissionAction, dataSource);
  }
}
