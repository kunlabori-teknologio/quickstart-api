import {repository} from '@loopback/repository'
import {google} from 'googleapis'
import jwt, {JwtPayload} from 'jsonwebtoken'
import {CompanyDTO} from '../dto/company.dto'
import {PersonDTO} from '../dto/person.dto'
import {ILoginResponse, ILoginUserInfo, IRefreshTokenResponse} from '../interfaces/auth.interface'
import {ICompanyFromAPI} from '../interfaces/company.interface'
import {IPersonFromAPI} from '../interfaces/person.interface'
import {IGoogleUser} from '../interfaces/user.interface'
import {Company} from '../models/company.model'
import {PermissionGroup} from '../models/permission-group.model'
import {Person} from '../models/person.model'
import {AdditionalInfoModel, Signup} from '../models/signup.model'
import {User} from '../models/user.model'
import {CompanyRepository, InvitationRepository, PersonRepository, UserHasPermissionGroupsRepository, UserRepository} from '../repositories'
import {theDatesMatch} from '../utils/date-manipulation-functions'
import {getUserType, UserTypesEnum} from '../utils/general-functions'
import {localeMessage, serverMessages} from '../utils/server-messages'
import {hideEmailString} from '../utils/string-manipulation-functions'

const fetch = require('node-fetch')

export class AuthService {
  constructor(
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(PersonRepository) private personRepository: PersonRepository,
    @repository(CompanyRepository) private companyRepository: CompanyRepository,
    @repository(InvitationRepository) private invitationRepository: InvitationRepository,
    @repository(UserHasPermissionGroupsRepository) private userHasPermissionGroupRepository: UserHasPermissionGroupsRepository,
  ) { }

  // Google OAuth configurations
  googleOAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.GOOGLE_REDIRECT_URI}/auth/google`
  );

  public async getGoogleLoginPageURL(params?: string): Promise<string> {
    try {
      const url = this.googleOAuth2Client.generateAuthUrl({
        'access_type': "offline",
        'scope':
          [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
          ],
        'state': params ?? ''
      });
      return url;
    } catch (err) {
      throw new Error(err.message)
    }
  }

  public async getGoogleUser(code: string): Promise<IGoogleUser> {
    try {
      const {tokens} = await this.googleOAuth2Client.getToken(code)
      this.googleOAuth2Client.setCredentials(tokens)
      const oauth2 = google.oauth2({version: 'v2', auth: this.googleOAuth2Client})
      const googleUser = await oauth2.userinfo.v2.me.get()
      return {email: googleUser.data.email, id: googleUser.data.id}
    } catch (err) {
      throw new Error(err.message)
    }
  }

  public createGoogleLoginToken(googleUser: IGoogleUser, invitationId?: string | null): string {
    return jwt.sign({
      email: googleUser.email, googleId: googleUser.id, invitationId
    },
      process.env.PROJECT_SECRET!, {
      expiresIn: '5m'
    })
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
          email, permissionGroupId: permissionGroupId!, _deletedAt: Date.now()
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

    user!.permissionGroups = await this.getOwnerNamesOfPermissionGroups(user!)

    return user
  }

  private async getOwnerNamesOfPermissionGroups(user: User): Promise<PermissionGroup[] | undefined> {
    const permissionGroupsOwnerIds = user?.permissionGroups?.map(permissioGroup => permissioGroup._ownerId)
    const permissionsGroupsOwners = await this.userRepository.find({
      where: {
        or: (permissionGroupsOwnerIds ?? []).map((permissionGroupOwnerId) => {
          return {_id: permissionGroupOwnerId}
        })
      },
      include: ['person', 'company']
    })
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

  public async getPermissionGroupIdFromInvitation(invitationId: string, email: string): Promise<string> {
    const invitation = await this.invitationRepository.findById(invitationId, {include: ['permissionGroup']})
    if (invitation.email !== email) throw new Error(serverMessages['auth']['emailInvitationIncorrect'][localeMessage])
    else return invitation.permissionGroupId
  }

  public async giveTheUserPermission(permissionGroupId: string, userId: string) {
    await this.userHasPermissionGroupRepository.create({userId, permissionGroupId})
  }

  public async signup(data: Signup, payload: JwtPayload): Promise<User> {
    const userType = getUserType(data)

    const profile =
      await this[`${userType}Repository`].findOne({where: {uniqueId: data.uniqueId}}) ??
      await this.createProfile({userType, ...data});

    if (!theDatesMatch(profile.birthday, data.birthday))
      throw new Error(serverMessages['auth']['birthdayIncorrect'][localeMessage])

    if (profile.userId) {
      const userWithSameProfile = await this.userRepository.findOne({where: {_id: profile.userId}})
      if (userWithSameProfile) throw new Error(`${serverMessages['auth']['uniqueIdInUse'][localeMessage]} ${hideEmailString(userWithSameProfile.email as string)}`)
    }

    const newUser = await this.userRepository.create({
      googleId: payload?.googleId,
      appleId: payload?.appleId,
      email: payload?.email,
    })

    await this[`${userType}Repository`].updateById(profile._id as string,
      {
        ...(data.additionalInfo ? (data.additionalInfo as AdditionalInfoModel)[`${userType}Info`] : {}),
        userId: newUser?._id as string,
      }
    )

    if (payload?.invitationId) {
      const permissionGroupId = await this.getPermissionGroupIdFromInvitation(payload?.invitationId, payload?.email)
      await this.giveTheUserPermission(permissionGroupId, newUser._id!)
    }

    return await this.userRepository.findById(newUser?._id, {include: ['person', 'company']})
  }

  public async createProfile(
    {userType, uniqueId, additionalInfo}:
      {userType: UserTypesEnum, uniqueId: string, additionalInfo?: AdditionalInfoModel}
  ): Promise<Person | Company> {
    try {
      let dataFromCpfCnpjApi = await fetch(`${process.env.API_CPF_CNPJ}/${userType === 'person' ? 2 : 6}/${uniqueId.replace(/\D/g, "")}`)
      dataFromCpfCnpjApi = dataFromCpfCnpjApi.json()
      if (!dataFromCpfCnpjApi.status) throw new Error(serverMessages['auth']['uniqueIdNotFound'][localeMessage])
      const dataTypedFromCpfCnpjApi: IPersonFromAPI | ICompanyFromAPI = await dataFromCpfCnpjApi;

      const profileDTO: PersonDTO | CompanyDTO =
        userType === 'person' ?
          new PersonDTO({dataFromApi: dataTypedFromCpfCnpjApi as IPersonFromAPI, additionalInfo: additionalInfo as AdditionalInfoModel}) :
          new CompanyDTO({dataFromApi: dataTypedFromCpfCnpjApi as ICompanyFromAPI, additionalInfo: additionalInfo as AdditionalInfoModel});

      const profileCreated = await this[`${userType}Repository`].create({...profileDTO});
      return profileCreated;
    } catch (err) {
      throw new Error(serverMessages['auth']['createProfileError'][localeMessage])
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
function PermissionGroupsRepository(PermissionGroupsRepository: any) {
  throw new Error('Function not implemented.')
}

