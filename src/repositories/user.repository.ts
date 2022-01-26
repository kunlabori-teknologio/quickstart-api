import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Company, Person, User, UserRelations, Permission, UserHasPermissions} from '../models';
import {CompanyRepository} from './company.repository';
import {PersonRepository} from './person.repository';
import {UserHasPermissionsRepository} from './user-has-permissions.repository';
import {PermissionRepository} from './permission.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype._id,
  UserRelations
> {

  public readonly person: HasOneRepositoryFactory<Person, typeof User.prototype._id>;

  public readonly company: HasOneRepositoryFactory<Company, typeof User.prototype._id>;

  public readonly permissions: HasManyThroughRepositoryFactory<Permission, typeof Permission.prototype._id,
          UserHasPermissions,
          typeof User.prototype._id
        >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('PersonRepository') protected personRepositoryGetter: Getter<PersonRepository>, @repository.getter('CompanyRepository') protected companyRepositoryGetter: Getter<CompanyRepository>, @repository.getter('UserHasPermissionsRepository') protected userHasPermissionsRepositoryGetter: Getter<UserHasPermissionsRepository>, @repository.getter('PermissionRepository') protected permissionRepositoryGetter: Getter<PermissionRepository>,
  ) {
    super(User, dataSource);
    this.permissions = this.createHasManyThroughRepositoryFactoryFor('permissions', permissionRepositoryGetter, userHasPermissionsRepositoryGetter,);
    this.registerInclusionResolver('permissions', this.permissions.inclusionResolver);
    this.company = this.createHasOneRepositoryFactoryFor('company', companyRepositoryGetter);
    this.registerInclusionResolver('company', this.company.inclusionResolver);
    this.person = this.createHasOneRepositoryFactoryFor('person', personRepositoryGetter);
    this.registerInclusionResolver('person', this.person.inclusionResolver);
  }
}
