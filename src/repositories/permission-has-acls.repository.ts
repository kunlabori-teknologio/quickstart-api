import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {PermissionHasAcls, PermissionHasAclsRelations} from '../models';

export class PermissionHasAclsRepository extends DefaultCrudRepository<
  PermissionHasAcls,
  typeof PermissionHasAcls.prototype._id,
  PermissionHasAclsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(PermissionHasAcls, dataSource);
  }
}
