import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Invitation, InvitationRelations, PermissionGroup} from '../models';
import {PermissionGroupRepository} from './permission-group.repository';

export class InvitationRepository extends DefaultCrudRepository<
  Invitation,
  typeof Invitation.prototype._id,
  InvitationRelations
> {

  public readonly permissionGroup: BelongsToAccessor<PermissionGroup, typeof Invitation.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('PermissionGroupRepository') protected permissionGroupRepositoryGetter: Getter<PermissionGroupRepository>,
  ) {
    super(Invitation, dataSource);
    this.permissionGroup = this.createBelongsToAccessorFor('permissionGroup', permissionGroupRepositoryGetter,);
    this.registerInclusionResolver('permissionGroup', this.permissionGroup.inclusionResolver);
  }
}
