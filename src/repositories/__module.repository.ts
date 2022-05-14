import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {ModuleRelations, __Module} from '../models';

export class __ModuleRepository extends DefaultCrudRepository<
  __Module,
  typeof __Module.prototype._id,
  ModuleRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(__Module, dataSource);
  }
}
