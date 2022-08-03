import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {IModulesPermissions} from '../interfaces/permission.interface';
import {__PermissionHasActionsRepository} from '../repositories/__permission-has-actions.repository';
import {__PermissionRepository} from '../repositories/__permission.repository';

@injectable({scope: BindingScope.TRANSIENT})
export class PermissionService {
  constructor(
    @repository(__PermissionRepository)
    private permissionRepository: __PermissionRepository,

    @repository(__PermissionHasActionsRepository)
    private permissionHasActionsRepository: __PermissionHasActionsRepository
  ) { }

  public async createPermissions(
    permissionGroupId: string,
    modulePermissionsArray: IModulesPermissions[],
  ): Promise<void> {

    for (
      let modulePermissionsIndex = 0;
      modulePermissionsIndex < modulePermissionsArray.length;
      modulePermissionsIndex++
    ) {
      const modulePermissions = modulePermissionsArray[modulePermissionsIndex];

      const permission = await this.permissionRepository.create({
        moduleId: modulePermissions.moduleId,
        permissionGroupId,
      })

      this.createPermissionHasActions(
        permission._id!,
        modulePermissions.permissionActions,
      )
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

    if (permissions && permissions.length) {
      await this.permissionHasActionsRepository.deleteAll({
        or: permissions.map(permission => {
          return {permissionId: permission._id}
        })
      })
    }

    await this.createPermissions(permissionGroupId, modules)
  }
}
