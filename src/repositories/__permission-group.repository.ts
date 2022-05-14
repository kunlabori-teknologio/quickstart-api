import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {PermissionGroupRelations, __Permission, __PermissionGroup} from '../models';
import {__PermissionRepository} from './__permission.repository';

export class __PermissionGroupRepository extends DefaultCrudRepository<
  __PermissionGroup,
  typeof __PermissionGroup.prototype._id,
  PermissionGroupRelations
> {

  public readonly permissions: HasManyRepositoryFactory<__Permission, typeof __PermissionGroup.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('PermissionRepository') protected permissionRepositoryGetter: Getter<__PermissionRepository>,
  ) {
    super(__PermissionGroup, dataSource);
    this.permissions = this.createHasManyRepositoryFactoryFor('permissions', permissionRepositoryGetter,);
    this.registerInclusionResolver('permissions', this.permissions.inclusionResolver);
  }
}

/* moduleName->Permissões<- */
