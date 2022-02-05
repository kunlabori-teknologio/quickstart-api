import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Project, ProjectRelations, PermissionGroup, Module} from '../models';
import {PermissionGroupRepository} from './permission-group.repository';
import {ModuleRepository} from './module.repository';

export class ProjectRepository extends DefaultCrudRepository<
  Project,
  typeof Project.prototype._id,
  ProjectRelations
> {

  public readonly permissionGroups: HasManyRepositoryFactory<PermissionGroup, typeof Project.prototype._id>;

  public readonly modules: HasManyRepositoryFactory<Module, typeof Project.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('PermissionGroupRepository') protected permissionGroupRepositoryGetter: Getter<PermissionGroupRepository>, @repository.getter('ModuleRepository') protected moduleRepositoryGetter: Getter<ModuleRepository>,
  ) {
    super(Project, dataSource);
    this.modules = this.createHasManyRepositoryFactoryFor('modules', moduleRepositoryGetter,);
    this.registerInclusionResolver('modules', this.modules.inclusionResolver);
    this.permissionGroups = this.createHasManyRepositoryFactoryFor('permissionGroups', permissionGroupRepositoryGetter,);
    this.registerInclusionResolver('permissionGroups', this.permissionGroups.inclusionResolver);
  }
}
