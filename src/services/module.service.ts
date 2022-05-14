import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {__PermissionAction} from '../models/__permission-action.model';
import {__PermissionGroup} from '../models/__permission-group.model';
import {__Permission} from '../models/__permission.model';
import {__PermissionActionRepository} from '../repositories/__permission-action.repository';
import {__PermissionGroupRepository} from '../repositories/__permission-group.repository';
import {__PermissionHasActionsRepository} from '../repositories/__permission-has-actions.repository';
import {__PermissionRepository} from '../repositories/__permission.repository';

@injectable({scope: BindingScope.TRANSIENT})
export class ModuleService {
  constructor(
    @repository(__PermissionGroupRepository) private permissionGroupRepository: __PermissionGroupRepository,
    @repository(__PermissionRepository) private permissionRepository: __PermissionRepository,
    @repository(__PermissionActionRepository) private permissionActionRepository: __PermissionActionRepository,
    @repository(__PermissionHasActionsRepository) private permissionHasActionsRepository: __PermissionHasActionsRepository,
  ) { }

  private async defaultPermissionGroupExists(): Promise<__PermissionGroup | null> {
    const defaultPermissionGroup = await this.permissionGroupRepository.findOne({
      where: {
        and: [
          {isAdminPermission: true}
        ]
      }
    })
    return defaultPermissionGroup ?? null;
  }

  private async createDefaultPermissionGroup(ownerId?: string): Promise<__PermissionGroup> {

    const defaultPermissionGroup = await this.permissionGroupRepository.create({
      name: 'Default',
      description: 'Default permission',
      isAdminPermission: true,
      _ownerId: ownerId,
    })

    return defaultPermissionGroup
  }

  private async createModuleDefaultPermission(moduleId: string, permissionGroupId: string): Promise<__Permission> {

    const defaultPermission = await this.permissionRepository.create({
      moduleId,
      permissionGroupId,
    })

    return defaultPermission
  }

  private async giveAllActionsToDefaultPermission(permissionId: string): Promise<void> {
    const permissionActions: __PermissionAction[] = await this.permissionActionRepository
      .find({
        where: {_deletedAt: {eq: null}}
      });

    await this.permissionHasActionsRepository.createAll(
      permissionActions.map((permissionAction: __PermissionAction) => {
        return {permissionId, permissionActionId: permissionAction._id!}
      })
    )
  }

  public async createDefaultPermission(moduleId: string, ownerId?: string): Promise<void> {

    try {

      let defaultPermissionGroup: __PermissionGroup | null = await this.defaultPermissionGroupExists()

      if (!defaultPermissionGroup) {
        defaultPermissionGroup = await this.createDefaultPermissionGroup(ownerId)
      }

      const defaultPermission: __Permission = await this.createModuleDefaultPermission(moduleId, defaultPermissionGroup._id!)

      await this.giveAllActionsToDefaultPermission(defaultPermission._id!)

    } catch (err) {

      throw new Error(err.message);

    }

  }

  public async deletePermissionAndPermissionActionsRelated(moduleId: string): Promise<void> {
    const permissions = await this.permissionRepository.find({where: {moduleId}})

    await this.permissionHasActionsRepository.deleteAll({
      or: (permissions.map((permission) => {
        return {permissionId: permission._id}
      }))
    })

    await this.permissionRepository.deleteAll({moduleId})
  }
}
