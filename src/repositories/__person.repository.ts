import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {PersonRelations, __Person} from '../models';

export class __PersonRepository extends DefaultCrudRepository<
  __Person,
  typeof __Person.prototype._id,
  PersonRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(__Person, dataSource);
  }
}
