import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository
} from '@loopback/repository';
import {AuthMongodbDataSource} from '../datasources';
import {
  __Permission,
  __PermissionGroup,
  __PermissionGroupRelations
} from '../models';
import {__PermissionRepository} from './__permission.repository';

export class __PermissionGroupRepository extends DefaultCrudRepository<
  __PermissionGroup,
  typeof __PermissionGroup.prototype._id,
  __PermissionGroupRelations
> {
  public readonly modulePermissions: HasManyRepositoryFactory<
    __Permission,
    typeof __PermissionGroup.prototype._id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: AuthMongodbDataSource,
    @repository.getter('__PermissionRepository')
    protected permissionRepositoryGetter: Getter<__PermissionRepository>,
  ) {
    super(__PermissionGroup, dataSource);
    this.modulePermissions = this.createHasManyRepositoryFactoryFor(
      'modulePermissions',
      permissionRepositoryGetter,
    );
    this.registerInclusionResolver(
      'modulePermissions',
      this.modulePermissions.inclusionResolver,
    );
  }
}

/* moduleName->Grupo de permissões<- */
