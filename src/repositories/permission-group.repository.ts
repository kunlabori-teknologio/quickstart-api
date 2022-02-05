import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {PermissionGroup, PermissionGroupRelations, Permission} from '../models';
import {PermissionRepository} from './permission.repository';

export class PermissionGroupRepository extends DefaultCrudRepository<
  PermissionGroup,
  typeof PermissionGroup.prototype._id,
  PermissionGroupRelations
> {

  public readonly permissions: HasManyRepositoryFactory<Permission, typeof PermissionGroup.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('PermissionRepository') protected permissionRepositoryGetter: Getter<PermissionRepository>,
  ) {
    super(PermissionGroup, dataSource);
    this.permissions = this.createHasManyRepositoryFactoryFor('permissions', permissionRepositoryGetter,);
    this.registerInclusionResolver('permissions', this.permissions.inclusionResolver);
  }
}
