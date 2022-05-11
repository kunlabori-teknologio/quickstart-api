import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Permission, PermissionGroup, PermissionGroupRelations} from '../models';
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

/* moduleName->Permissões<- */
