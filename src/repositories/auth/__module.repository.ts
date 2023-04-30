import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AuthMongodbDataSource} from '../../datasources';
import {__Module, __ModuleRelations} from '../../models';

export class __ModuleRepository extends DefaultCrudRepository<
  __Module,
  typeof __Module.prototype._id,
  __ModuleRelations
> {
  constructor(
    @inject('datasources.auth_mongodb') dataSource: AuthMongodbDataSource,
  ) {
    super(__Module, dataSource);
  }
}
