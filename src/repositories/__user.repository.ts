import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyThroughRepositoryFactory, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {__Company, __PermissionGroup, __Person, __User, __UserHasPermissionGroups, __UserRelations} from '../models';
import {__CompanyRepository} from './__company.repository';
import {__PermissionGroupRepository} from './__permission-group.repository';
import {__PersonRepository} from './__person.repository';
import {__UserHasPermissionGroupsRepository} from './__user-has-permission-groups.repository';

export class __UserRepository extends DefaultCrudRepository<
  __User,
  typeof __User.prototype._id,
  __UserRelations
> {

  public readonly person: HasOneRepositoryFactory<__Person, typeof __User.prototype._id>;

  public readonly company: HasOneRepositoryFactory<__Company, typeof __User.prototype._id>;

  public readonly permissionGroups: HasManyThroughRepositoryFactory<__PermissionGroup, typeof __PermissionGroup.prototype._id,
    __UserHasPermissionGroups,
    typeof __User.prototype._id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('__PersonRepository') protected personRepositoryGetter: Getter<__PersonRepository>,
    @repository.getter('__CompanyRepository') protected companyRepositoryGetter: Getter<__CompanyRepository>,
    @repository.getter('__UserHasPermissionGroupsRepository') protected userHasPermissionGroupsRepositoryGetter: Getter<__UserHasPermissionGroupsRepository>,
    @repository.getter('__PermissionGroupRepository') protected permissionGroupRepositoryGetter: Getter<__PermissionGroupRepository>,
  ) {
    super(__User, dataSource);
    this.permissionGroups = this.createHasManyThroughRepositoryFactoryFor('permissionGroups', permissionGroupRepositoryGetter, userHasPermissionGroupsRepositoryGetter,);
    this.registerInclusionResolver('permissionGroups', this.permissionGroups.inclusionResolver);
    this.company = this.createHasOneRepositoryFactoryFor('company', companyRepositoryGetter);
    this.registerInclusionResolver('company', this.company.inclusionResolver);
    this.person = this.createHasOneRepositoryFactoryFor('person', personRepositoryGetter);
    this.registerInclusionResolver('person', this.person.inclusionResolver);
  }
}
