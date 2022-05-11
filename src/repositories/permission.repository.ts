import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, HasManyThroughRepositoryFactory, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Module, Permission, PermissionAction, PermissionHasActions, PermissionRelations} from '../models';
import {ModuleRepository} from './module.repository';
import {PermissionActionRepository} from './permission-action.repository';
import {PermissionGroupRepository} from './permission-group.repository';
import {PermissionHasActionsRepository} from './permission-has-actions.repository';

export class PermissionRepository extends DefaultCrudRepository<
  Permission,
  typeof Permission.prototype._id,
  PermissionRelations
> {

  public readonly permissionActions: HasManyThroughRepositoryFactory<PermissionAction, typeof PermissionAction.prototype._id,
    PermissionHasActions,
    typeof Permission.prototype._id
  >;

  public readonly module: BelongsToAccessor<Module, typeof Permission.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('PermissionHasActionsRepository') protected permissionHasActionsRepositoryGetter: Getter<PermissionHasActionsRepository>,
    @repository.getter('PermissionActionRepository') protected permissionActionRepositoryGetter: Getter<PermissionActionRepository>, @repository.getter('ModuleRepository') protected moduleRepositoryGetter: Getter<ModuleRepository>, @repository.getter('PermissionGroupRepository') protected permissionGroupRepositoryGetter: Getter<PermissionGroupRepository>,
  ) {
    super(Permission, dataSource);
    this.module = this.createBelongsToAccessorFor('module', moduleRepositoryGetter,);
    this.registerInclusionResolver('module', this.module.inclusionResolver);

    this.permissionActions = this.createHasManyThroughRepositoryFactoryFor('permissionActions', permissionActionRepositoryGetter, permissionHasActionsRepositoryGetter,);
    this.registerInclusionResolver('permissionActions', this.permissionActions.inclusionResolver);
  }
}

/* moduleName->Permissões<- */
