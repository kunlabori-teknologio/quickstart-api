import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Company, CompanyRelations} from '../models';

export class CompanyRepository extends DefaultCrudRepository<
  Company,
  typeof Company.prototype._id,
  CompanyRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Company, dataSource);
  }
}
