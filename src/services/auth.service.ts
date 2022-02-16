import {repository} from '@loopback/repository'
import jwt from 'jsonwebtoken'
import {AdditionalInfoModel, Signup} from '../entities/signup.entity'
import {LocaleEnum} from '../enums/locale.enum'
import {IGetProfile, ILoginResponse, ILoginUserInfo, IOAuthLogin, IRefreshTokenResponse} from '../interfaces/auth.interface'
import {IOAuthUser} from '../interfaces/user.interface'
import {Company} from '../models/company.model'
import {PermissionGroup} from '../models/permission-group.model'
import {Person} from '../models/person.model'
import {User} from '../models/user.model'
import {CompanyRepository, InvitationRepository, PersonRepository, UserHasPermissionGroupsRepository, UserRepository} from '../repositories'
import {theDatesMatch} from '../utils/date-manipulation-functions'
import {getUserType, UserTypesEnum} from '../utils/general-functions'
import {serverMessages} from '../utils/server-messages'
import {hideEmailString} from '../utils/string-manipulation-functions'

export class AuthService {

  constructor(
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(PersonRepository) private personRepository: PersonRepository,
    @repository(CompanyRepository) private companyRepository: CompanyRepository,
    @repository(InvitationRepository) private invitationRepository: InvitationRepository,
    @repository(UserHasPermissionGroupsRepository) private userHasPermissionGroupRepository: UserHasPermissionGroupsRepository,
  ) { }

  public async getOAuthLoginPageURL(oAuth: IOAuthLogin, params?: string): Promise<string> {
    return oAuth.getOAuthLoginPageUrl(params)
  }

  public async getOAuthUser(oAuth: IOAuthLogin, code: string): Promise<IOAuthUser> {
    return oAuth.getOAuthUser(code)
  }

  public createOAuthToken(oAuth: IOAuthLogin, oAuthUser: IOAuthUser, invitationId?: string | null): string {
    return oAuth.createOAuthToken(oAuthUser, invitationId)
  }

  public async login(userLoginInfo: ILoginUserInfo): Promise<ILoginResponse | null> {

    const {email, googleId, invitationId} = userLoginInfo

    const permissionGroupId = invitationId ?
      await this.getPermissionGroupIdFromInvitation(invitationId, email!) : null

    let user = await this.findUserWithPermissions(email!, googleId!)
    if (!user) return null

    if (invitationId) {
      const userHasPermissionGroup = user.permissionGroups?.find(permissionGroup => permissionGroup._id === permissionGroupId)
      if (!userHasPermissionGroup) {
        await this.giveTheUserPermission(permissionGroupId!, user._id!)
        user = await this.findUserWithPermissions(email!, googleId!)
        await this.invitationRepository.updateById(invitationId, {
          email, permissionGroupId: permissionGroupId!, _deletedAt: new Date()
        })
      }
    }

    return {
      authToken: jwt.sign({
        id: user?._id,
      }, process.env.PROJECT_SECRET!, {
        expiresIn: '5m'
      }),
      authRefreshToken: jwt.sign({
        id: user?._id,
      }, process.env.PROJECT_SECRET!, {
        expiresIn: '10m'
      }),
      userData: user
    }

  }

  private async findUserWithPermissions(email: string, googleId: string, appleId?: string): Promise<User | null> {

    const user = await this.userRepository.findOne({
      where: {and: [{email}, {googleId}]}, include: [
        'person', 'company',
        {
          relation: 'permissionGroups', scope: {
            where: {projectId: process.env.PROJECT_ID},
            include: [{
              relation: 'permissions', scope: {
                include: ['module', 'permissionActions']
              }
            }]
          }
        }
      ]
    })

    if (user)
      user!.permissionGroups = await this.getOwnerNamesOfPermissionGroups(user!)

    return user
  }

  private async getOwnerNamesOfPermissionGroups(user: User): Promise<PermissionGroup[] | undefined> {

    const permissionGroupsOwnerIds = user?.permissionGroups?.map(permissioGroup => permissioGroup._ownerId)

    const whereCondition = permissionGroupsOwnerIds ?
      {
        where: {
          or: (permissionGroupsOwnerIds ?? []).map((permissionGroupOwnerId) => {
            return {_id: permissionGroupOwnerId}
          })
        },
        include: ['person', 'company']
      } : {}

    const permissionsGroupsOwners = await this.userRepository.find(whereCondition)

    return user?.permissionGroups?.map(permissioGroup => {
      const owner = permissionsGroupsOwners.find((permissionGroupOwner) =>
        permissionGroupOwner._id?.toString() === permissioGroup._ownerId?.toString()
      )
      permissioGroup.owner = {
        _id: owner?._id,
        name: owner?.person.name ?? owner?.company.tradeName,
      }
      return permissioGroup
    })

  }

  public async getPermissionGroupIdFromInvitation(invitationId: string, email: string, locale?: LocaleEnum): Promise<string> {

    const invitation = await this.invitationRepository.findById(invitationId, {include: ['permissionGroup']})

    if (invitation.email !== email) throw new Error(serverMessages['auth']['emailInvitationIncorrect'][locale ?? LocaleEnum['pt-BR']])

    else return invitation.permissionGroupId

  }

  public async giveTheUserPermission(permissionGroupId: string, userId: string) {

    await this.userHasPermissionGroupRepository.create({userId, permissionGroupId})

  }

  public async signup(data: Signup, userInfo: ILoginUserInfo, getProfile: IGetProfile, locale?: LocaleEnum): Promise<User> {

    const userType = getUserType(data, locale)

    const profile =
      await this[`${userType}Repository`].findOne({where: {uniqueId: data.uniqueId}}) ??
      await this.createProfile({userType, ...data}, getProfile, locale);

    if (!theDatesMatch(profile.birthday, data.birthday))
      throw new Error(serverMessages['auth']['birthdayIncorrect'][locale ?? LocaleEnum['pt-BR']])

    if (profile.userId) {
      const userWithSameProfile = await this.userRepository.findOne({where: {_id: profile.userId}})
      if (userWithSameProfile) throw new Error(`${serverMessages['auth']['uniqueIdInUse'][locale ?? LocaleEnum['pt-BR']]} ${hideEmailString(userWithSameProfile.email as string)}`)
    }

    const newUser = await this.userRepository.create({
      googleId: userInfo?.googleId,
      appleId: userInfo?.appleId,
      email: userInfo?.email,
    })

    await this[`${userType}Repository`].updateById(profile._id as string,
      {
        ...(data.additionalInfo ? (data.additionalInfo as AdditionalInfoModel)[`${userType}Info`] : {}),
        userId: newUser?._id as string,
      }
    )

    if (userInfo?.invitationId) {
      const permissionGroupId = await this.getPermissionGroupIdFromInvitation(userInfo?.invitationId, userInfo?.email!, locale)
      await this.giveTheUserPermission(permissionGroupId, newUser._id!)
    }

    return await this.userRepository.findById(newUser?._id, {include: ['person', 'company']})
  }

  public async createProfile(
    {userType, uniqueId, additionalInfo}:
      {userType: UserTypesEnum, uniqueId: string, additionalInfo?: AdditionalInfoModel},
    getProfile: IGetProfile,
    locale?: LocaleEnum
  ): Promise<Person | Company> {
    try {

      const profileDTO = await getProfile.getFullProfileInfo(uniqueId, userType, additionalInfo)
      if (!profileDTO) throw new Error(serverMessages['auth']['uniqueIdNotFound'][locale ?? LocaleEnum['pt-BR']])

      const profileCreated = await this[`${userType}Repository`].create({...profileDTO})

      return profileCreated

    } catch (err) {

      throw new Error(serverMessages['auth']['createProfileError'][locale ?? LocaleEnum['pt-BR']])

    }
  }

  public async refreshToken(id: string): Promise<IRefreshTokenResponse> {

    return {
      authToken: jwt.sign({
        id: id,
      }, process.env.PROJECT_SECRET!, {
        expiresIn: '5m'
      }),
      authRefreshToken: jwt.sign({
        id: id,
      }, process.env.PROJECT_SECRET!, {
        expiresIn: '10m'
      })
    }

  }
}

