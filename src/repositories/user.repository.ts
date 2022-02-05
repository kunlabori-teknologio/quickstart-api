import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyThroughRepositoryFactory, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Company, PermissionGroup, Person, User, UserHasPermissionGroups, UserRelations} from '../models';
import {CompanyRepository} from './company.repository';
import {PermissionGroupRepository} from './permission-group.repository';
import {PersonRepository} from './person.repository';
import {UserHasPermissionGroupsRepository} from './user-has-permission-groups.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype._id,
  UserRelations
> {

  public readonly person: HasOneRepositoryFactory<Person, typeof User.prototype._id>;

  public readonly company: HasOneRepositoryFactory<Company, typeof User.prototype._id>;

  public readonly permissionGroups: HasManyThroughRepositoryFactory<PermissionGroup, typeof PermissionGroup.prototype._id,
    UserHasPermissionGroups,
    typeof User.prototype._id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('PersonRepository') protected personRepositoryGetter: Getter<PersonRepository>,
    @repository.getter('CompanyRepository') protected companyRepositoryGetter: Getter<CompanyRepository>,
    @repository.getter('UserHasPermissionGroupsRepository') protected userHasPermissionGroupsRepositoryGetter: Getter<UserHasPermissionGroupsRepository>,
    @repository.getter('PermissionGroupRepository') protected permissionGroupRepositoryGetter: Getter<PermissionGroupRepository>,
  ) {
    super(User, dataSource);
    this.permissionGroups = this.createHasManyThroughRepositoryFactoryFor('permissionGroups', permissionGroupRepositoryGetter, userHasPermissionGroupsRepositoryGetter,);
    this.registerInclusionResolver('permissionGroups', this.permissionGroups.inclusionResolver);
    this.company = this.createHasOneRepositoryFactoryFor('company', companyRepositoryGetter);
    this.registerInclusionResolver('company', this.company.inclusionResolver);
    this.person = this.createHasOneRepositoryFactoryFor('person', personRepositoryGetter);
    this.registerInclusionResolver('person', this.person.inclusionResolver);
  }
}
