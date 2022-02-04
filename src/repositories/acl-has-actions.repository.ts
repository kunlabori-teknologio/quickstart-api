import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {AclHasActions, AclHasActionsRelations} from '../models';

export class AclHasActionsRepository extends DefaultCrudRepository<
  AclHasActions,
  typeof AclHasActions.prototype._id,
  AclHasActionsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(AclHasActions, dataSource);
  }
}
