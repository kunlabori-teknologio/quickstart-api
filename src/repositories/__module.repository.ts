import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {__Module, __ModuleRelations} from '../models';

export class __ModuleRepository extends DefaultCrudRepository<
  __Module,
  typeof __Module.prototype._id,
  __ModuleRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(__Module, dataSource);
  }
}
