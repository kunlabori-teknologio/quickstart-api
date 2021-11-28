import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {AclAction, AclActionRelations} from '../models';

export class AclActionRepository extends DefaultCrudRepository<
  AclAction,
  typeof AclAction.prototype._id,
  AclActionRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(AclAction, dataSource);
  }
}
