import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Acl, AclRelations} from '../models';

export class AclRepository extends DefaultCrudRepository<
  Acl,
  typeof Acl.prototype._id,
  AclRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Acl, dataSource);
  }
}
