import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Invitation, InvitationRelations, Permission, InvitationHasPermissions} from '../models';
import {InvitationHasPermissionsRepository} from './invitation-has-permissions.repository';
import {PermissionRepository} from './permission.repository';

export class InvitationRepository extends DefaultCrudRepository<
  Invitation,
  typeof Invitation.prototype._id,
  InvitationRelations
> {

  public readonly permissions: HasManyThroughRepositoryFactory<Permission, typeof Permission.prototype._id,
          InvitationHasPermissions,
          typeof Invitation.prototype._id
        >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('InvitationHasPermissionsRepository') protected invitationHasPermissionsRepositoryGetter: Getter<InvitationHasPermissionsRepository>, @repository.getter('PermissionRepository') protected permissionRepositoryGetter: Getter<PermissionRepository>,
  ) {
    super(Invitation, dataSource);
    this.permissions = this.createHasManyThroughRepositoryFactoryFor('permissions', permissionRepositoryGetter, invitationHasPermissionsRepositoryGetter,);
    this.registerInclusionResolver('permissions', this.permissions.inclusionResolver);
  }
}
