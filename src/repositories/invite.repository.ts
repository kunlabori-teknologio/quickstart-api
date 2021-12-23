import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Invite, InviteRelations} from '../models';

export class InviteRepository extends DefaultCrudRepository<
  Invite,
  typeof Invite.prototype._id,
  InviteRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Invite, dataSource);
  }
}
