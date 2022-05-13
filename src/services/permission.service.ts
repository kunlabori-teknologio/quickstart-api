import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {IModulesPermissions} from '../interfaces/permission.interface';
import {PermissionHasActionsRepository} from '../repositories/permission-has-actions.repository';
import {PermissionRepository} from './../repositories/permission.repository';

@injectable({scope: BindingScope.TRANSIENT})
export class PermissionService {
  constructor(
    @repository(PermissionRepository)
    private permissionRepository: PermissionRepository,

    @repository(PermissionHasActionsRepository)
    private permissionHasActionsRepository: PermissionHasActionsRepository
  ) { }

  public async createPermissions(
    permissionGroupId: string,
    modulesPermissionsArray: IModulesPermissions[],
  ): Promise<void> {

    for (
      let modulesPermissionsIndex = 0;
      modulesPermissionsIndex < modulesPermissionsArray.length;
      modulesPermissionsIndex++
    ) {
      const modulesPermissions = modulesPermissionsArray[modulesPermissionsIndex];

      for (
        let moduleIndex = 0;
        moduleIndex < modulesPermissions.modules.length;
        moduleIndex++
      ) {
        const module = modulesPermissions.modules[moduleIndex];

        const permission = await this.permissionRepository.create({
          moduleId: module,
          permissionGroupId,
        })

        this.createPermissionHasActions(
          permission._id!,
          modulesPermissions.permissions,
        )

      }
    }
  }

  public async createPermissionHasActions(
    permissionId: string,
    actions: string[],
  ): Promise<void> {

    await this.permissionHasActionsRepository.createAll(
      actions.map(permissionActionId => {
        return {permissionId, permissionActionId}
      })
    )
  }

  public async updatePermissions(
    permissionGroupId: string,
    modules: IModulesPermissions[],
  ): Promise<void> {

    const permissions = await this.permissionRepository.find({where: {permissionGroupId}})

    await this.permissionRepository.deleteAll({permissionGroupId})

    await this.permissionHasActionsRepository.deleteAll({
      or: permissions.map(permission => {
        return {permissionId: permission._id}
      })
    })

    await this.createPermissions(permissionGroupId, modules)
  }
}
