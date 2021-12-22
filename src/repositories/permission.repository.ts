import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Permission, PermissionRelations} from '../models';

export class PermissionRepository extends DefaultCrudRepository<
  Permission,
  typeof Permission.prototype._id,
  PermissionRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Permission, dataSource);
  }
}
