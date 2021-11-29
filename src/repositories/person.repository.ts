import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Person, PersonRelations} from '../models';

export class PersonRepository extends DefaultCrudRepository<
  Person,
  typeof Person.prototype._id,
  PersonRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Person, dataSource);
  }
}
