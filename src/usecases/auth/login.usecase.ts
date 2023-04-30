import {service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  FindUserWithPermissions,
  GetDefaultPermissionGroupId,
  GetPermissionGroupIdFromInvitation,
  GiveTheUserPermission,
} from '.';
import {ILoginResponse, ILoginUserInfo} from '../../interfaces/auth.interface';
import {__InvitationRepository} from '../../repositories';
import {GenerateJwt} from '../jwt';

export class Login {

  constructor(
    @service(GetPermissionGroupIdFromInvitation)
    private getPermissionGroupIdFromInvitation: GetPermissionGroupIdFromInvitation,

    @service(GetDefaultPermissionGroupId)
    private getDefaultPermissionGroupId: GetDefaultPermissionGroupId,

    @service(FindUserWithPermissions)
    private findUserWithPermissions: FindUserWithPermissions,

    @service(GiveTheUserPermission)
    private giveTheUserPermission: GiveTheUserPermission,

    @service(GenerateJwt)
    private generateJwt: GenerateJwt,

    @repository(__InvitationRepository)
    private invitationRepository: __InvitationRepository,
  ){}

  public async execute(
    userLoginInfo: ILoginUserInfo
  ): Promise<ILoginResponse | null>{
    const {email, googleId, appleId, invitationId} = userLoginInfo;

    const permissionGroupId = invitationId ?
      await this.getPermissionGroupIdFromInvitation.execute(invitationId, email!) :
      await this.getDefaultPermissionGroupId.execute()

    let user = await this.findUserWithPermissions
      .execute(email!, googleId, appleId);
    if (!user) return null;

    const userHasPermissionGroup = user.permissionGroups?.find((permissionGroup: any) =>
      permissionGroup._id === permissionGroupId
    );

    if (!userHasPermissionGroup) {

      await this.giveTheUserPermission.execute(permissionGroupId!, user._id!)
      user = await this.findUserWithPermissions
        .execute(email!, googleId, appleId);

      if (invitationId) {
        await this.invitationRepository.updateById(invitationId, {
          email, permissionGroupId: permissionGroupId!, _deletedAt: new Date()
        })
      }

    }

    const authToken = this.generateJwt.execute({ id: user?._id }, '1d');
    const authRefreshToken = this.generateJwt.execute({ id: user?._id }, '7d');

    return {
      authToken,
      authRefreshToken,
      userData: user
    };
  }

}
