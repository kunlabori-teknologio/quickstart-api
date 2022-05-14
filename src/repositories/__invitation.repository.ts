import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {__Invitation, __InvitationRelations, __PermissionGroup} from '../models';
import {__PermissionGroupRepository} from './__permission-group.repository';

export class __InvitationRepository extends DefaultCrudRepository<
  __Invitation,
  typeof __Invitation.prototype._id,
  __InvitationRelations
> {

  public readonly permissionGroup: BelongsToAccessor<__PermissionGroup, typeof __Invitation.prototype._id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('__PermissionGroupRepository') protected permissionGroupRepositoryGetter: Getter<__PermissionGroupRepository>,
  ) {
    super(__Invitation, dataSource);
    this.permissionGroup = this.createBelongsToAccessorFor('permissionGroup', permissionGroupRepositoryGetter,);
    this.registerInclusionResolver('permissionGroup', this.permissionGroup.inclusionResolver);
  }
}
