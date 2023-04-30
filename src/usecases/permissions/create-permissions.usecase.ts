import {repository} from '@loopback/repository';
import {IModulesPermissions} from '../../interfaces/permission.interface';
import {__PermissionHasActionsRepository, __PermissionRepository} from '../../repositories';

export class CreatePermissions {

  constructor(
    @repository(__PermissionRepository) private permissionRepository: __PermissionRepository,
    @repository(__PermissionHasActionsRepository) private permissionHasActionsRepository: __PermissionHasActionsRepository,
  ){

  }

  public async execute(
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

  private async createPermissionHasActions(
    permissionId: string,
    actions: string[],
  ): Promise<void> {

    await this.permissionHasActionsRepository.createAll(
      actions.map(permissionActionId => {
        return {permissionId, permissionActionId}
      })
    )
  }

}
