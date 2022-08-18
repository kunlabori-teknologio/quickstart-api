import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {AuthMongodbDataSource} from '../datasources';
import {__Company, __CompanyRelations} from '../models';

export class __CompanyRepository extends DefaultCrudRepository<
  __Company,
  typeof __Company.prototype._id,
  __CompanyRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: AuthMongodbDataSource,
  ) {
    super(__Company, dataSource);
  }
}
