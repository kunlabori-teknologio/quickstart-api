import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Project, ProjectRelations, Permission} from '../models';
import {PermissionRepository} from './permission.repository';

export class ProjectRepository extends DefaultCrudRepository<
  Project,
  typeof Project.prototype._id,
  ProjectRelations
> {

  public readonly permissions: HasManyRepositoryFactory<Permission, typeof Project.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('PermissionRepository') protected permissionRepositoryGetter: Getter<PermissionRepository>,
  ) {
    super(Project, dataSource);
    this.permissions = this.createHasManyRepositoryFactoryFor('permissions', permissionRepositoryGetter,);
    this.registerInclusionResolver('permissions', this.permissions.inclusionResolver);
  }
}
