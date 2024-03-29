import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {__User} from './../models/__user.model';
import {__UserRepository} from './../repositories/__user.repository';

export type RelatedUsers = unknown;

@injectable({scope: BindingScope.TRANSIENT})
export class RelatedUsersService {
  constructor(

    @repository(__UserRepository) private userRepository: __UserRepository

  ) { }

  public async getRelatedUsersWithPermissions(userId: string, ownerId?: string): Promise<__User[]> {
    let where = {
      or: [
        {_ownerId: userId}
      ],
      and: [
        {project: process.env.DB}
      ]
    }
    if (ownerId) where.or.push({_ownerId: ownerId})

    const result = await this.userRepository.find({
      include: [
        {relation: 'person'},
        {relation: 'company'},
        {
          relation: 'permissionGroups',
          scope: {
            where
          }
        }
      ],
      fields: ['email', '_id']
    })

    return (result || []).filter(el => el.permissionGroups && el.permissionGroups.length)

  }

  public async getPermissionIdsOfARelatedUser(
    ownerId: string,
    userId: string,
  ): Promise<any[]> {

    const relatedUsersWithPermissions = await this.getRelatedUsersWithPermissions(ownerId)

    const userWithPermissions = relatedUsersWithPermissions.find(user => user._id?.toString() === userId)

    if (!userWithPermissions || !userWithPermissions.permissionGroups) return []

    return userWithPermissions.permissionGroups.map(permissionGroup => permissionGroup._id)
  }
}
