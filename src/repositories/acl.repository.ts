import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Acl, AclRelations, AclAction, AclHasActions} from '../models';
import {AclHasActionsRepository} from './acl-has-actions.repository';
import {AclActionRepository} from './acl-action.repository';

export class AclRepository extends DefaultCrudRepository<
  Acl,
  typeof Acl.prototype._id,
  AclRelations
> {

  public readonly aclActions: HasManyThroughRepositoryFactory<AclAction, typeof AclAction.prototype._id,
          AclHasActions,
          typeof Acl.prototype._id
        >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('AclHasActionsRepository') protected aclHasActionsRepositoryGetter: Getter<AclHasActionsRepository>, @repository.getter('AclActionRepository') protected aclActionRepositoryGetter: Getter<AclActionRepository>,
  ) {
    super(Acl, dataSource);
    this.aclActions = this.createHasManyThroughRepositoryFactoryFor('aclActions', aclActionRepositoryGetter, aclHasActionsRepositoryGetter,);
    this.registerInclusionResolver('aclActions', this.aclActions.inclusionResolver);
  }
}
