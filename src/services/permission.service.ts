import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {localeMessage, serverMessages} from '../utils/server-messages';
import {PermissionHasAclsRepository} from './../repositories/permission-has-acls.repository';
import {PermissionRepository} from './../repositories/permission.repository';
import {UserHasPermissionsRepository} from './../repositories/user-has-permissions.repository';
import {UserRepository} from './../repositories/user.repository';

@injectable({scope: BindingScope.TRANSIENT})
export class PermissionService {
  constructor(
    /* Add @inject to inject parameters */
    /**
     * Repositories
     */
    @repository(PermissionHasAclsRepository)
    private permissionHasAclsRepository: PermissionHasAclsRepository,
    @repository(PermissionRepository)
    private permissionRepository: PermissionRepository,
    @repository(UserRepository)
    private userRepository: UserRepository,
    @repository(UserHasPermissionsRepository)
    private userHasPermissions: UserHasPermissionsRepository
  ) { }

  /**
   * Relate acl to permission
   * @param permissionId string
   * @param aclsIds array of string
   */
  public async relateACLs(
    {permissionId, aclsIds}: {permissionId: string, aclsIds: string[]}
  ): Promise<void> {
    await this.permissionHasAclsRepository.createAll(
      aclsIds.map(aclId => {
        return {permissionId, aclId};
      }),
    );
  }
  /**
   * Delete Related acls
   * @param permissionId string
   */
  public async deleteRelatedACLs({permissionId}: {permissionId: string}): Promise<void> {
    await this.permissionHasAclsRepository.deleteAll({permissionId});
  }
  /**
   * Check if user and permissions exists
   * @param userId string
   * @param permissionsIds array of string
   */
  public async checkIfUserAndPermissionsExists(
    {userId, permissionsIds}: {userId: string, permissionsIds: string[]}
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    const permissions = await this.permissionRepository.find({
      where: {
        or: permissionsIds.map(permissionId => {
          return {_id: permissionId};
        })
      }
    });
    if (!user || !permissions.length)
      throw new Error(serverMessages['permission']['userOrPermissionNotFound'][localeMessage]);
  }
  /**
   * Relate permissions to user
   * @param userId string
   * @param permissionsIds array of string
   */
  public async relatePermissions(
    {userId, permissionsIds}: {userId: string, permissionsIds: string[]}
  ): Promise<void> {
    await this.userHasPermissions.createAll(
      permissionsIds.map(permissionId => {
        return {permissionId, userId};
      }),
    );
  }
  /**
   * Remove permissions to user
   * @param userId string
   * @param permissionsIds array of string
   */
  public async removePermissions(
    {userId, permissionsIds}: {userId: string, permissionsIds: string[]}
  ): Promise<void> {
    await this.userHasPermissions.deleteAll({
      or: permissionsIds.map(permissionId => {
        return {
          and: [{userId}, {permissionId}]
        }
      })
    });
  }
}
