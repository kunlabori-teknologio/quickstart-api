import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Module, ModuleRelations} from '../models';

export class ModuleRepository extends DefaultCrudRepository<
  Module,
  typeof Module.prototype._id,
  ModuleRelations
> {

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Module, dataSource);
  }
}
