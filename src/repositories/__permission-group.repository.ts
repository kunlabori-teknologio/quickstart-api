import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {__Permission, __PermissionGroup, __PermissionGroupRelations} from '../models';
import {__PermissionRepository} from './__permission.repository';

export class __PermissionGroupRepository extends DefaultCrudRepository<
  __PermissionGroup,
  typeof __PermissionGroup.prototype._id,
  __PermissionGroupRelations
> {

  public readonly permissions: HasManyRepositoryFactory<__Permission, typeof __PermissionGroup.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('__PermissionRepository') protected permissionRepositoryGetter: Getter<__PermissionRepository>,
  ) {
    super(__PermissionGroup, dataSource);
    this.permissions = this.createHasManyRepositoryFactoryFor('permissions', permissionRepositoryGetter,);
    this.registerInclusionResolver('permissions', this.permissions.inclusionResolver);
  }
}

/* moduleName->Permissões<- */
