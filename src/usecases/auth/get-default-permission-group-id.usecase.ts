import {repository} from '@loopback/repository';
import {__PermissionGroup} from '../../models';
import {__PermissionGroupRepository} from '../../repositories';

export class GetDefaultPermissionGroupId {

  constructor(
    @repository(__PermissionGroupRepository)
    private permissionGroupRepository: __PermissionGroupRepository,
  ){}

  public async execute(): Promise<string | undefined> {

      const defaultPermissionGroup: __PermissionGroup | null = await this.permissionGroupRepository
        .findOne({
          where: {
            and: [{isAdminPermission: true}]
          }
        });

      return defaultPermissionGroup?._id;

  }

}
