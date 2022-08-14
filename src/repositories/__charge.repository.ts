import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {__Charge, __ChargeRelations} from '../models';

export class __ChargeRepository extends DefaultCrudRepository<
  __Charge,
  typeof __Charge.prototype._id,
  __ChargeRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(__Charge, dataSource);
  }
}
