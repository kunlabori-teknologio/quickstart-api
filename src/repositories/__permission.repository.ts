import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, HasManyThroughRepositoryFactory, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {PermissionRelations, __Module, __Permission, __PermissionAction, __PermissionHasActions} from '../models';
import {__ModuleRepository} from './__module.repository';
import {__PermissionActionRepository} from './__permission-action.repository';
import {__PermissionGroupRepository} from './__permission-group.repository';
import {__PermissionHasActionsRepository} from './__permission-has-actions.repository';

export class __PermissionRepository extends DefaultCrudRepository<
  __Permission,
  typeof __Permission.prototype._id,
  PermissionRelations
> {

  public readonly permissionActions: HasManyThroughRepositoryFactory<__PermissionAction, typeof __PermissionAction.prototype._id,
    __PermissionHasActions,
    typeof __Permission.prototype._id
  >;

  public readonly module: BelongsToAccessor<__Module, typeof __Permission.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('PermissionHasActionsRepository') protected permissionHasActionsRepositoryGetter: Getter<__PermissionHasActionsRepository>,
    @repository.getter('PermissionActionRepository') protected permissionActionRepositoryGetter: Getter<__PermissionActionRepository>, @repository.getter('ModuleRepository') protected moduleRepositoryGetter: Getter<__ModuleRepository>, @repository.getter('PermissionGroupRepository') protected permissionGroupRepositoryGetter: Getter<__PermissionGroupRepository>,
  ) {
    super(__Permission, dataSource);
    this.module = this.createBelongsToAccessorFor('module', moduleRepositoryGetter,);
    this.registerInclusionResolver('module', this.module.inclusionResolver);

    this.permissionActions = this.createHasManyThroughRepositoryFactoryFor('permissionActions', permissionActionRepositoryGetter, permissionHasActionsRepositoryGetter,);
    this.registerInclusionResolver('permissionActions', this.permissionActions.inclusionResolver);
  }
}