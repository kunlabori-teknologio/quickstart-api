import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {IModule} from '../interfaces/permission.interface';
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
    modules: IModule[],
  ): Promise<void> {

    for (let permissionIndex = 0; permissionIndex < modules.length; permissionIndex++) {
      const permission = modules[permissionIndex];

      for (let moduleIndex = 0; moduleIndex < permission.modules.length; moduleIndex++) {
        const module = permission.modules[moduleIndex];

        const permissionCreated = await this.permissionRepository.create({
          moduleId: module,
          permissionGroupId,
        })

        await this.permissionHasActionsRepository
          .createAll(
            permission.permissions
              .map((permissionActionId: string) => {
                return {permissionId: permissionCreated?._id, permissionActionId}
              })
          )
      }

    }
  }

  public async updatePermissions(
    permissionGroupId: string,
    modules: IModule[],
  ): Promise<void> {

    await this.permissionRepository.deleteAll({permissionGroupId})

    await this.createPermissions(permissionGroupId, modules)
  }

  // public async createPermissionHasActions(
  //   permissions: Permission[],
  //   modules: IModule[],
  // ): Promise<void> {
  //   console.log(53, permissions)
  //   console.log(54, modules)
  //   for (let permissionIndex = 0; permissionIndex < permissions.length; permissionIndex++) {

  //     const permission = permissions[permissionIndex];

  //     await this.permissionHasActionsRepository
  //       .createAll(
  //         modules[permissionIndex].permissions
  //           .map((permissionActionId: string) => {
  //             return {permissionId: permission?._id, permissionActionId}
  //           })
  //       )

  //   }

  // }

  // public async updatePermissionHasActions(
  //   permissionsToDelete: Permission[],
  //   permissions: Permission[],
  //   modules: IModule[],
  // ): Promise<void> {

  //   await this.permissionHasActionsRepository.deleteAll({
  //     or: permissionsToDelete.map(permission => {
  //       return {permissionId: permission._id}
  //     })
  //   })

  //   for (let permissionIndex = 0; permissionIndex < permissions.length; permissionIndex++) {

  //     const permission = permissions[permissionIndex];

  //     await this.permissionHasActionsRepository
  //       .createAll(
  //         modules[permissionIndex].permissions
  //           .map((permissionActionId: string) => {
  //             return {permission: permission?._id, permissionActionId}
  //           })
  //       )

  //   }

  // }
}
