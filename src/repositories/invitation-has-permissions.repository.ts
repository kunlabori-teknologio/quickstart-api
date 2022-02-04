import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {InvitationHasPermissions, InvitationHasPermissionsRelations} from '../models';

export class InvitationHasPermissionsRepository extends DefaultCrudRepository<
  InvitationHasPermissions,
  typeof InvitationHasPermissions.prototype._id,
  InvitationHasPermissionsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(InvitationHasPermissions, dataSource);
  }
}
