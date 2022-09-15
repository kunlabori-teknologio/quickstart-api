import {repository} from '@loopback/repository'
import {AdditionalInfoModel, Signup} from '../entities/signup.entity'
import {LocaleEnum} from '../enums/locale.enum'
import {Autentikigo} from '../implementations'
import {IGetProfile, ILoginResponse, ILoginUserInfo, IOAuthLogin, IRefreshTokenResponse} from '../interfaces/auth.interface'
import {IOAuthUser} from '../interfaces/user.interface'
import {__Company} from '../models/__company.model'
import {__PermissionGroup} from '../models/__permission-group.model'
import {__Person} from '../models/__person.model'
import {__User} from '../models/__user.model'
import {__CompanyRepository, __InvitationRepository, __PermissionGroupRepository, __PersonRepository, __UserHasPermissionGroupsRepository, __UserRepository} from '../repositories'
import {theDatesMatch} from '../utils/date-manipulation-functions'
import {getUserType, UserTypesEnum} from '../utils/general-functions'
import {serverMessages} from '../utils/server-messages'
import {hideEmailString} from '../utils/string-manipulation-functions'

export class AuthService {

  constructor(
    @repository(__UserRepository) private userRepository: __UserRepository,
    @repository(__PersonRepository) private personRepository: __PersonRepository,
    @repository(__CompanyRepository) private companyRepository: __CompanyRepository,
    @repository(__InvitationRepository) private invitationRepository: __InvitationRepository,
    @repository(__UserHasPermissionGroupsRepository) private userHasPermissionGroupRepository: __UserHasPermissionGroupsRepository,
    @repository(__PermissionGroupRepository) private permissionGroupRepository: __PermissionGroupRepository,
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

    const {email, googleId, appleId, invitationId} = userLoginInfo

    let user = await this.findUserWithPermissions(email!, googleId, appleId)
    if (!user) return null

    if (invitationId) {

      const invitationPermissionGroupId = await this.getPermissionGroupIdFromInvitation(invitationId, email!)

      const userAlreadyHasPermissionGroupFromInvitation = user.permissionGroups?.find(permissionGroup => permissionGroup._id === invitationPermissionGroupId)
      if (!userAlreadyHasPermissionGroupFromInvitation) {
        await this.giveTheUserPermission(invitationPermissionGroupId!, user._id!)

        await this.invitationRepository.updateById(invitationId, {
          email, permissionGroupId: invitationPermissionGroupId!, _deletedAt: new Date()
        })
      }

    } else if (!user.permissionGroups?.length) {

      if (
        !process.env.ADMIN_USERS ||
        (
          process.env.ADMIN_USERS &&
          process.env.ADMIN_USERS.split(',').includes(email!)
        )
      ) {

        const defaultPermissionGroupId = await this.getDefaultPermissionGroupId()
        await this.giveTheUserPermission(defaultPermissionGroupId!, user._id!)
        user = await this.findUserWithPermissions(email!, googleId, appleId)

      } else throw new Error(serverMessages['auth']['userIsNotAdmin'][LocaleEnum['pt-BR']])

    }

    const authToken = await Autentikigo.generateToken({id: user?._id}, '24h')
    const authRefreshToken = await Autentikigo.generateToken({id: user?._id}, '7d')

    return {
      authToken,
      authRefreshToken,
      userData: user
    }

  }

  private async findUserWithPermissions(email: string, googleId?: string, appleId?: string): Promise<__User | null> {
    const oAuthWhere = googleId ? {googleId} : {appleId}

    const user = await this.userRepository.findOne({
      where: {and: [{email}, oAuthWhere]}, include: [
        'person', 'company',
        {
          relation: 'permissionGroups', scope: {
            include: [{
              relation: 'modulePermissions', scope: {
                include: [
                  {
                    relation: 'module',
                    scope: {
                      where: {
                        'or': [
                          {'project': process.env.DB},
                          {'project': process.env.AUTH_DB || null},
                        ]
                      }
                    }
                  },
                  'permissionActions'
                ]
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

  private async getOwnerNamesOfPermissionGroups(user: __User): Promise<__PermissionGroup[] | undefined> {

    const permissionGroupsOwnerIds = user?.permissionGroups?.map(permissionGroup => {
      if (permissionGroup.isAdminPermission) return user._id
      return permissionGroup._ownerId
    })

    const whereCondition = permissionGroupsOwnerIds ?
      {
        where: {},
        include: ['person', 'company']
      } : {}
    if (permissionGroupsOwnerIds?.length)
      whereCondition['where'] = {
        or: permissionGroupsOwnerIds?.map((permissionGroupOwnerId) => {
          return {_id: permissionGroupOwnerId}
        })
      }

    const permissionsGroupsOwners = await this.userRepository.find(whereCondition)

    return user?.permissionGroups?.map(permissionGroup => {
      const owner = permissionsGroupsOwners.find((permissionGroupOwner) => {
        const ownerId = permissionGroup.isAdminPermission ? user._id : permissionGroup._ownerId
        return permissionGroupOwner._id?.toString() === ownerId?.toString()
      })
      permissionGroup.owner = {
        _id: owner?._id,
        name: owner?.person?.name ?? owner?.company?.tradeName,
      }
      permissionGroup.modulePermissions = permissionGroup.modulePermissions.filter(modulePermission => modulePermission.module)
      return permissionGroup
    })

  }

  public async getPermissionGroupIdFromInvitation(invitationId: string, email: string, locale?: LocaleEnum): Promise<string> {

    const invitation = await this.invitationRepository.findById(invitationId, {include: ['permissionGroup']})

    if (invitation.email !== email) throw new Error(serverMessages['auth']['emailInvitationIncorrect'][locale ?? LocaleEnum['pt-BR']])

    else return invitation.permissionGroupId

  }

  private async getDefaultPermissionGroupId(): Promise<string | undefined> {

    const defaultPermissionGroup: __PermissionGroup | null = await this.permissionGroupRepository.findOne({
      where: {
        and: [
          {isAdminPermission: true}
        ]
      }
    })

    return defaultPermissionGroup?._id

  }

  public async giveTheUserPermission(permissionGroupId: string, userId: string) {

    await this.userHasPermissionGroupRepository.create({userId, permissionGroupId})

  }

  public async signup(data: Signup, userInfo: ILoginUserInfo, getProfile: IGetProfile, token: string, locale?: LocaleEnum): Promise<__User> {

    const userType = getUserType(data, locale)

    const profile =
      await this[`${userType}Repository`].findOne({where: {uniqueId: data.uniqueId}}) ??
      await this.createProfile({userType, ...data}, getProfile, token, locale);

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

      await this.invitationRepository.updateById(userInfo?.invitationId, {
        email: userInfo?.email, permissionGroupId: permissionGroupId!, _deletedAt: new Date()
      })
    }

    return this.userRepository.findById(newUser?._id, {include: ['person', 'company']})
  }

  public async createProfile(
    {userType, uniqueId, additionalInfo}:
      {userType: UserTypesEnum, uniqueId: string, additionalInfo?: AdditionalInfoModel},
    getProfile: IGetProfile,
    token: string,
    locale?: LocaleEnum
  ): Promise<__Person | __Company> {
    try {

      const profileDTO = await Autentikigo.getProfile(userType, uniqueId, token)
      if (!profileDTO) throw new Error(serverMessages['auth']['uniqueIdNotFound'][locale ?? LocaleEnum['pt-BR']])

      delete profileDTO['data']['userId']
      delete profileDTO['data']['_id']

      const profileCreated = await this[`${userType}Repository`].create({...profileDTO['data']})

      return profileCreated

    } catch (err) {

      throw new Error(serverMessages['auth']['createProfileError'][locale ?? LocaleEnum['pt-BR']])

    }
  }

  public async refreshToken(id: string): Promise<IRefreshTokenResponse> {

    const authToken = await Autentikigo.generateToken({id}, '24h')
    const authRefreshToken = await Autentikigo.generateToken({id}, '7d')

    return {
      authToken,
      authRefreshToken,
    }

  }

  public async verifyAuthorization(userId: string, action: string, collection: string) {

    let ownerId = null

    const permissionGroups = await this.userRepository
      .permissionGroups(userId)
      .find({
        include: [{
          relation: 'modulePermissions', scope: {
            include: [
              {relation: 'permissionActions', scope: {where: {name: action}}},
              {relation: 'module', scope: {where: {collection}}}
            ]
          }
        }]
      })
    const permissionGroup = permissionGroups[0]

    if (action) {
      if (permissionGroup) {
        let userHasPermission = false;
        permissionGroup.modulePermissions?.forEach(permission => {
          if (permission.module && permission.permissionActions.length) {
            userHasPermission = true
            ownerId = permissionGroup._createdBy
          }
        })
        if (!userHasPermission) throw serverMessages['httpResponse']['unauthorizedError'][LocaleEnum['pt-BR']]
      } else throw serverMessages['httpResponse']['unauthorizedError'][LocaleEnum['pt-BR']]
    }

    return {userId, ownerId}
  }
}

