import {service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {IModulesPermissions} from '../../interfaces/permission.interface';
import {__PermissionHasActionsRepository, __PermissionRepository} from '../../repositories';
import {CreatePermissions} from './create-permissions.usecase';

export class UpdatePermissions {

  constructor(
    @repository(__PermissionRepository) private permissionRepository: __PermissionRepository,
    @repository(__PermissionHasActionsRepository) private permissionHasActionsRepository: __PermissionHasActionsRepository,

    @service(CreatePermissions) private createPermissions: CreatePermissions,
  ){}

  public async execute(
    permissionGroupId: string,
    modules: IModulesPermissions[],
  ): Promise<void>{
    const permissions = await this.permissionRepository.find({where: {permissionGroupId}})

    await this.permissionRepository.deleteAll({permissionGroupId})

    if (permissions && permissions.length) {
      await this.permissionHasActionsRepository.deleteAll({
        or: permissions.map(permission => {
          return {permissionId: permission._id}
        })
      })
    }

    await this.createPermissions.execute(permissionGroupId, modules);
  }

}
