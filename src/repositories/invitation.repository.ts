import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Invitation, InvitationRelations} from '../models';

export class InvitationRepository extends DefaultCrudRepository<
  Invitation,
  typeof Invitation.prototype._id,
  InvitationRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Invitation, dataSource);
  }
}
