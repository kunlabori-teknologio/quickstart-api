import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {IModule} from '../interfaces/permission.interface';
import {PermissionHasActionsRepository} from '../repositories/permission-has-actions.repository';
import {Permission} from './../models/permission.model';
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
    modules: IModule[],
  ): Promise<Permission[]> {

    const permissions = await this.permissionRepository.createAll(
      modules.map((module: IModule) => {
        return module.modules.map(module => {
          return {
            moduleId: module,
            permissionGroupId
          }
        })
      }).flat()
    )

    return permissions
  }

  public async updatePermissions(
    permissionGroupId: string,
    modules: IModule[],
  ): Promise<Permission[]> {

    await this.permissionRepository.deleteAll({permissionGroupId})

    const permissions = await this.createPermissions(permissionGroupId, modules)

    return permissions
  }

  public async createPermissionHasActions(
    permissions: Permission[],
    modules: IModule[],
  ): Promise<void> {

    for (let permissionIndex = 0; permissionIndex < permissions.length; permissionIndex++) {

      const permission = permissions[permissionIndex];

      await this.permissionHasActionsRepository
        .createAll(
          modules[permissionIndex].permissions
            .map((permissionActionId: string) => {
              return {permission: permission?._id, permissionActionId}
            })
        )

    }

  }

  public async updatePermissionHasActions(
    permissionsToDelete: Permission[],
    permissions: Permission[],
    modules: IModule[],
  ): Promise<void> {

    await this.permissionHasActionsRepository.deleteAll({
      or: permissionsToDelete.map(permission => {
        return {permissionId: permission._id}
      })
    })

    for (let permissionIndex = 0; permissionIndex < permissions.length; permissionIndex++) {

      const permission = permissions[permissionIndex];

      await this.permissionHasActionsRepository
        .createAll(
          modules[permissionIndex].permissions
            .map((permissionActionId: string) => {
              return {permission: permission?._id, permissionActionId}
            })
        )

    }

  }
}
