import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Module, ModuleRelations, Acl} from '../models';
import {AclRepository} from './acl.repository';

export class ModuleRepository extends DefaultCrudRepository<
  Module,
  typeof Module.prototype._id,
  ModuleRelations
> {

  public readonly acls: HasManyRepositoryFactory<Acl, typeof Module.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('AclRepository') protected aclRepositoryGetter: Getter<AclRepository>,
  ) {
    super(Module, dataSource);
    this.acls = this.createHasManyRepositoryFactoryFor('acls', aclRepositoryGetter,);
    this.registerInclusionResolver('acls', this.acls.inclusionResolver);
  }
}
