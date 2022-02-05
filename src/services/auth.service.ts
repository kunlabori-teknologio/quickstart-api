import {repository} from '@loopback/repository'
import {google} from 'googleapis'
import jwt from 'jsonwebtoken'
import {CompanyDTO} from '../dto/company.dto'
import {PersonDTO} from '../dto/person.dto'
import {Company} from '../models/company.model'
import {Person} from '../models/person.model'
import {AdditionalInfoModel} from '../models/signup.model'
import {CompanyRepository, PersonRepository, UserRepository} from '../repositories'
import {userTypesEnum} from '../utils/general-functions'
import {localeMessage, serverMessages} from '../utils/server-messages'

const fetch = require('node-fetch')

export class AuthService {
  constructor(
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(PersonRepository) private personRepository: PersonRepository,
    @repository(CompanyRepository) private companyRepository: CompanyRepository,
  ) { }

  // Google OAuth configurations
  googleOAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.GOOGLE_REDIRECT_URI}/auth/google`
  );

  public async getGoogleLoginPageURL(): Promise<string> {
    try {
      const url = this.googleOAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope:
          [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
          ],
      });
      return url;
    } catch (err) {
      throw new Error(err.message)
    }
  }

  public async getGoogleUser(code: string): Promise<any> {
    try {
      const {tokens} = await this.googleOAuth2Client.getToken(code)
      this.googleOAuth2Client.setCredentials(tokens)
      let oauth2 = google.oauth2({version: 'v2', auth: this.googleOAuth2Client})
      const googleUser = await oauth2.userinfo.v2.me.get()
      return googleUser.data
    } catch (err) {
      throw new Error(err.message)
    }
  }

  public createGoogleLoginToken(googleUser: any): string {
    return jwt.sign({
      email: googleUser.email, googleId: googleUser.id
    },
      process.env.PROJECT_SECRET!, {
      expiresIn: '5m'
    })
  }

  public async login(userLoginInfo: any): Promise<any | null> {
    const {email, googleId} = userLoginInfo

    const userWithArrayOfPermissions = await this.userRepository.findOne({
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
    if (!userWithArrayOfPermissions) return null
    let user = {
      ...userWithArrayOfPermissions,
      permissionGroup: userWithArrayOfPermissions.permissionGroups?.length ?
        userWithArrayOfPermissions.permissionGroups[0] : {}
    }
    delete user['permissionGroups']

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

  public async createProfile(
    {userType, uniqueId, additionalInfo}:
      {userType: userTypesEnum, uniqueId: string, additionalInfo?: AdditionalInfoModel}
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

  public async refreshToken(id: string): Promise<any> {
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
