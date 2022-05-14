import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, HasManyThroughRepositoryFactory, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {__Module, __Permission, __PermissionAction, __PermissionHasActions, __PermissionRelations} from '../models';
import {__ModuleRepository} from './__module.repository';
import {__PermissionActionRepository} from './__permission-action.repository';
import {__PermissionGroupRepository} from './__permission-group.repository';
import {__PermissionHasActionsRepository} from './__permission-has-actions.repository';

export class __PermissionRepository extends DefaultCrudRepository<
  __Permission,
  typeof __Permission.prototype._id,
  __PermissionRelations
> {

  public readonly permissionActions: HasManyThroughRepositoryFactory<__PermissionAction, typeof __PermissionAction.prototype._id,
    __PermissionHasActions,
    typeof __Permission.prototype._id
  >;

  public readonly module: BelongsToAccessor<__Module, typeof __Permission.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('__PermissionHasActionsRepository') protected permissionHasActionsRepositoryGetter: Getter<__PermissionHasActionsRepository>,
    @repository.getter('__PermissionActionRepository') protected permissionActionRepositoryGetter: Getter<__PermissionActionRepository>, @repository.getter('__ModuleRepository') protected moduleRepositoryGetter: Getter<__ModuleRepository>, @repository.getter('__PermissionGroupRepository') protected permissionGroupRepositoryGetter: Getter<__PermissionGroupRepository>,
  ) {
    super(__Permission, dataSource);
    this.module = this.createBelongsToAccessorFor('module', moduleRepositoryGetter,);
    this.registerInclusionResolver('module', this.module.inclusionResolver);

    this.permissionActions = this.createHasManyThroughRepositoryFactoryFor('permissionActions', permissionActionRepositoryGetter, permissionHasActionsRepositoryGetter,);
    this.registerInclusionResolver('permissionActions', this.permissionActions.inclusionResolver);
  }
}
