import {service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {ILoginUserInfo} from '../../interfaces/auth.interface';
import {__CompanyRepository, __PersonRepository, __UserRepository} from '../../repositories';
import {theDatesMatch} from '../../utils/date-manipulation-functions';
import {getUserType} from '../../utils/general-functions';
import {serverMessages} from '../../utils/server-messages';
import {hideEmailString} from '../../utils/string-manipulation-functions';
import {CreateProfile, IAdditionalInfo} from './create-profile.usecase';
import {GetPermissionGroupIdFromInvitation} from './get-permission-group-id-from-invitation.usecase';
import {GiveTheUserPermission} from './give-the-user-permission.usercase';

export class Signup {

  constructor(
    @service(CreateProfile) private createProfile: CreateProfile,
    @service(GetPermissionGroupIdFromInvitation)
    private getPermissionGroupIdFromInvitation: GetPermissionGroupIdFromInvitation,
    @service(GiveTheUserPermission) private giveTheUserPermission: GiveTheUserPermission,

    @repository(__UserRepository) private userRepository: __UserRepository,
    @repository(__PersonRepository) private personRepository: __PersonRepository,
    @repository(__CompanyRepository) private companyRepository: __CompanyRepository,
  ){}

  public async execute(
    data: any,
    userInfo: ILoginUserInfo,
  ){
    const userType = getUserType(data);

    const profile =
      await this[`${userType}Repository`].findOne({where: {uniqueId: data.uniqueId}}) ??
      await this.createProfile.execute({userType, ...data});

    if (!theDatesMatch(profile.birthday!, data.birthday))
      throw new Error(serverMessages.auth.birthdayIncorrect['pt-BR']);

    if (profile.userId) {
      const userWithSameProfile = await this.userRepository
        .findOne({where: {_id: profile.userId}});

      if (userWithSameProfile)
        throw new Error(`${serverMessages.auth.uniqueIdInUse['pt-BR']} ${hideEmailString(userWithSameProfile.email as string)}`);
    }

    const newUser = await this.userRepository.create({
      googleId: userInfo?.googleId,
      appleId: userInfo?.appleId,
      email: userInfo?.email,
    });

    await this[`${userType}Repository`].updateById(profile._id as string,
      {
        ...(data.additionalInfo ? (data.additionalInfo as IAdditionalInfo)[`${userType}Info`] : {}),
        userId: newUser?._id as string,
      }
    );

    if (userInfo?.invitationId) {
      const permissionGroupId = await this.getPermissionGroupIdFromInvitation
        .execute(userInfo?.invitationId, userInfo?.email!);

      await this.giveTheUserPermission.execute(permissionGroupId, newUser._id!);
    }

    return await this.userRepository
      .findById(newUser?._id, {include: ['person', 'company']});
  }

}
