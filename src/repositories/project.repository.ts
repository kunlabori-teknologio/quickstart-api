import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Project, ProjectRelations, Module} from '../models';
import {ModuleRepository} from './module.repository';

export class ProjectRepository extends DefaultCrudRepository<
  Project,
  typeof Project.prototype._id,
  ProjectRelations
> {

  public readonly modules: HasManyRepositoryFactory<Module, typeof Project.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('ModuleRepository') protected moduleRepositoryGetter: Getter<ModuleRepository>,
  ) {
    super(Project, dataSource);
    this.modules = this.createHasManyRepositoryFactoryFor('modules', moduleRepositoryGetter,);
    this.registerInclusionResolver('modules', this.modules.inclusionResolver);
  }
}
