import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AuthMongodbDataSource} from '../datasources';
import {__Person, __PersonRelations} from '../models';

export class __PersonRepository extends DefaultCrudRepository<
  __Person,
  typeof __Person.prototype._id,
  __PersonRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: AuthMongodbDataSource) {
    super(__Person, dataSource);
  }
}
