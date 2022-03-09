import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Permission} from '../models/permission.model';
import {PermissionAction} from './../models/permission-action.model';
import {PermissionGroup} from './../models/permission-group.model';
import {PermissionActionRepository} from './../repositories/permission-action.repository';
import {PermissionGroupRepository} from './../repositories/permission-group.repository';
import {PermissionHasActionsRepository} from './../repositories/permission-has-actions.repository';
import {PermissionRepository} from './../repositories/permission.repository';

@injectable({scope: BindingScope.TRANSIENT})
export class ModuleService {
  constructor(
    @repository(PermissionGroupRepository) private permissionGroupRepository: PermissionGroupRepository,
    @repository(PermissionRepository) private permissionRepository: PermissionRepository,
    @repository(PermissionActionRepository) private permissionActionRepository: PermissionActionRepository,
    @repository(PermissionHasActionsRepository) private permissionHasActionsRepository: PermissionHasActionsRepository,
  ) { }

  private async defaultPermissionGroupExists(projectId: string): Promise<PermissionGroup | null> {
    const defaultPermissionGroup = await this.permissionGroupRepository.findOne({
      where: {
        and: [
          {projectId}, {isAdminPermission: true}
        ]
      }
    })
    return defaultPermissionGroup ?? null;
  }

  private async createDefaultPermissionGroup(projectId: string): Promise<PermissionGroup> {

    const defaultPermissionGroup = await this.permissionGroupRepository.create({
      name: 'Default',
      description: 'Default permission',
      projectId,
      isAdminPermission: true,
    })

    return defaultPermissionGroup
  }

  private async createModuleDefaultPermission(moduleId: string, permissionGroupId: string): Promise<Permission> {

    const defaultPermission = await this.permissionRepository.create({
      moduleId,
      permissionGroupId,
    })

    return defaultPermission
  }

  private async giveAllActionsToDefaultPermission(permissionId: string): Promise<void> {
    const permissionActions: PermissionAction[] = await this.permissionActionRepository
      .find({
        where: {_deletedAt: {eq: null}}
      });

    await this.permissionHasActionsRepository.createAll(
      permissionActions.map((permissionAction: PermissionAction) => {
        return {permissionId, permissionActionId: permissionAction._id!}
      })
    )

    throw new Error('Not implemented')
  }

  public async createDefaultPermission(projectId: string, moduleId: string): Promise<void> {

    try {

      let defaultPermissionGroup: PermissionGroup | null = await this.defaultPermissionGroupExists(projectId)

      if (!defaultPermissionGroup) {
        defaultPermissionGroup = await this.createDefaultPermissionGroup(projectId)
      }

      const defaultPermission: Permission = await this.createModuleDefaultPermission(moduleId, defaultPermissionGroup._id!)

      await this.giveAllActionsToDefaultPermission(defaultPermission._id!)

    } catch (err) {

      throw new Error(err.message);

    }

  }
}
