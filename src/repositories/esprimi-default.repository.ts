import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {EsprimiDefault, EsprimiDefaultRelations} from '../models';

export class EsprimiDefaultRepository extends DefaultCrudRepository<
  EsprimiDefault,
  typeof EsprimiDefault.prototype._id,
  EsprimiDefaultRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(EsprimiDefault, dataSource);
  }
}
