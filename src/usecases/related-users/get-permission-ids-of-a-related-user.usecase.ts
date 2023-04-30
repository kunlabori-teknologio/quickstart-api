import {service} from '@loopback/core';
import {GetRelatedUserWithPermissions} from '.';

export class GetPermissionIdsOfARelatedUser {

  constructor(
    @service(GetRelatedUserWithPermissions) private getRelatedUserWithPermissions: GetRelatedUserWithPermissions,
  ){}

  public async execute(
    ownerId: string,
    userId: string,
  ): Promise<(string | undefined)[]>{
    const relatedUsersWithPermissions = await this.getRelatedUserWithPermissions.execute(ownerId);

    const userWithPermissions = relatedUsersWithPermissions.find(user => user._id?.toString() === userId)

    if (!userWithPermissions || !userWithPermissions.permissionGroups) return []

    return userWithPermissions.permissionGroups.map(permissionGroup => permissionGroup._id)
  }

}
