import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {User, UserRelations, Person, Company} from '../models';
import {PersonRepository} from './person.repository';
import {CompanyRepository} from './company.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype._id,
  UserRelations
> {

  public readonly personId: HasOneRepositoryFactory<Person, typeof User.prototype._id>;

  public readonly companyId: HasOneRepositoryFactory<Company, typeof User.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('PersonRepository') protected personRepositoryGetter: Getter<PersonRepository>, @repository.getter('CompanyRepository') protected companyRepositoryGetter: Getter<CompanyRepository>,
  ) {
    super(User, dataSource);
    this.companyId = this.createHasOneRepositoryFactoryFor('companyId', companyRepositoryGetter);
    this.registerInclusionResolver('companyId', this.companyId.inclusionResolver);
    this.personId = this.createHasOneRepositoryFactoryFor('personId', personRepositoryGetter);
    this.registerInclusionResolver('personId', this.personId.inclusionResolver);
  }
}
