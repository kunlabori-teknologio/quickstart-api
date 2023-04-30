import {repository} from '@loopback/repository';
import {__PermissionGroup, __User} from '../../models';
import {__UserRepository} from '../../repositories/auth/__user.repository';

export class FindUserWithPermissions {

  constructor(
    @repository(__UserRepository) private userRepository: __UserRepository,
  ){}

  public async execute(
    email: string,
    googleId?: string,
    appleId?: string,
  ): Promise<__User | null> {
    const oAuthWhere = googleId ? {googleId} : {appleId}

    const user = await this.userRepository.findOne({
      where: {and: [{email}, oAuthWhere]}, include: [
        'person', 'company',
        {
          relation: 'permissionGroups', scope: {
            include: [{
              relation: 'permissions', scope: {
                include: ['module', 'permissionActions']
              }
            }]
          }
        }
      ]
    });
    user?.permissionGroups?.forEach((permissionGroup: any) => {
      permissionGroup.permissions.forEach((permission: any) => {
        console.log(permission)
      });
    });
    if (user)
      user!.permissionGroups = await this.getOwnerNamesOfPermissionGroups(user!)

    return user;
  }

  private async getOwnerNamesOfPermissionGroups(user: __User): Promise<__PermissionGroup[] | undefined> {

    const permissionGroupsOwnerIds = user?.permissionGroups?.map((permissionGroup: any) => {
      if (permissionGroup.isAdminPermission) return user._id
      return permissionGroup._ownerId
    })

    let whereCondition = permissionGroupsOwnerIds ?
      {
        where: {},
        include: ['person', 'company']
      } : {}
    if (permissionGroupsOwnerIds?.length)
      whereCondition['where'] = {
        or: permissionGroupsOwnerIds?.map((permissionGroupOwnerId: any) => {
          return {_id: permissionGroupOwnerId}
        })
      }

    const permissionsGroupsOwners = await this.userRepository.find(whereCondition)

    return user?.permissionGroups?.map((permissionGroup: any) => {
      const owner = permissionsGroupsOwners.find((permissionGroupOwner) => {
        const ownerId = permissionGroup.isAdminPermission ? user._id : permissionGroup._ownerId
        return permissionGroupOwner._id?.toString() === ownerId?.toString()
      })
      permissionGroup.owner = {
        _id: owner?._id,
        name: owner?.person?.name ?? owner?.company?.tradeName,
      }
      return permissionGroup
    })

  }

}
