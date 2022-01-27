import {BindingScope, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {google} from 'googleapis';
import jwt, {JwtPayload} from 'jsonwebtoken';
import {CompanyDTO} from '../dto/company.dto';
import {ISsoUser} from '../interfaces/auth.interface';
import {Company, Person} from '../models';
import {AdditionalInfoModel} from '../models/signup.model';
import {PersonRepository, ProjectRepository, UserRepository} from '../repositories';
import {compareDates} from '../utils/date-manipulation-functions';
import {getUserType, userTypes} from '../utils/general-functions';
import {hideEmailString} from '../utils/string-manipulation-functions';
import {PersonDTO} from './../dto/person.dto';
import {ssoEnum, SSOUserDto} from './../dto/sso-user.dto';
import {IRegistryCheck} from './../interfaces/auth.interface';
import {CompanyRepository} from './../repositories/company.repository';
import {UserHasPermissionsRepository} from './../repositories/user-has-permissions.repository';
import {UserService} from './user.service';

const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    /* Add @inject to inject parameters */
    // Repositories
    @repository(UserRepository)
    private userRepository: UserRepository,
    @repository(PersonRepository)
    private personRepository: PersonRepository,
    @repository(CompanyRepository)
    private companyRepository: CompanyRepository,
    @repository(ProjectRepository)
    private projectRepository: ProjectRepository,
    @repository(UserHasPermissionsRepository)
    private userHasPermissionsRepository: UserHasPermissionsRepository,
    // Services
    @service(UserService)
    private userService: UserService,
  ) { }

  googleOAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.SERVER_ROOT_URI}:${process.env.PORT}/auth/google`
  );

  /*
   * Add service methods here
   */
  public async getGoogleAuthURL(redirectUri: string): Promise<string> {

    const url = this.googleOAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope:
        [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ],
      state: `redirectUri=${redirectUri}`,
    });

    return url;
  }

  public async checkUser(code: string, projectId: string, permissionId?: string): Promise<IRegistryCheck> {

    // Local functions
    const getGoogleAuthenticatedUser = async (code: string): Promise<ISsoUser> => {
      const {tokens} = await this.googleOAuth2Client.getToken(code);
      this.googleOAuth2Client.setCredentials(tokens);
      let oauth2 = google.oauth2({version: 'v2', auth: this.googleOAuth2Client});
      const googleUser = await oauth2.userinfo.v2.me.get();

      return new SSOUserDto({dataFromSSO: googleUser.data as IUserFromGoogle, sso: 'google' as ssoEnum});
    }

    // Main function
    try {
      const ssoUser = await getGoogleAuthenticatedUser(code);

      const user = await this.userService.getUserWithPermissions({
        condition: {where: {googleId: ssoUser.googleId}},
        projectId
      });

      let authToken;

      if (user) {
        /**
         * Create permission
         */
        if (permissionId)
          await this.userHasPermissionsRepository.create({userId: user._id, permissionId})
        /**
         * Create auth token
         */
        authToken = jwt.sign({
          id: user._id, projectId
        }, process.env.JWT_SECRET!, {expiresIn: '5m'});
        return {registeredUser: true, authToken, user};
      } else {
        authToken = jwt.sign({
          googleId: ssoUser.googleId, appleId: null,
          email: ssoUser.email, projectId, permissionId
        }, process.env.JWT_SECRET!, {expiresIn: '5m'});

        return {registeredUser: false, authToken};
      }

    } catch (e) {

      throw new HttpErrors[400](e.message);

    }
  }

  public async createUser(
    {authToken, uniqueId, birthday, country, additionalInfo}:
      {authToken: string, uniqueId: string, birthday: Date, country: string, additionalInfo?: AdditionalInfoModel}
  ): Promise<IRegistryCheck> {

    // Local functions
    const createProfile = async (
      {userType, uniqueId, additionalInfo}:
        {userType: userTypes, uniqueId: string, additionalInfo?: AdditionalInfoModel}
    ): Promise<Person | Company> => {
      const apiResponse = await fetch(`${process.env.API_CPF_CNPJ}/${userType === 'person' ? 2 : 6}/${uniqueId.replace(/\D/g, "")}`);

      const dataFromApi: IPersonFromAPI | ICompanyFromAPI = await apiResponse.json();

      const profileDTO: PersonDTO | CompanyDTO =
        userType === 'person' ?
          new PersonDTO({dataFromApi: dataFromApi as IPersonFromAPI, additionalInfo: additionalInfo as AdditionalInfoModel}) :
          new CompanyDTO({dataFromApi: dataFromApi as ICompanyFromAPI, additionalInfo: additionalInfo as AdditionalInfoModel});

      const profileCreated = await this[`${userType}Repository`].create({...profileDTO});

      return profileCreated;
    }

    // Main function
    try {

      const tokenDecoded = jwt.verify(authToken, process.env.JWT_SECRET!) as JwtPayload;

      // Get user type and profile (person or company)
      const userType = getUserType({uniqueId, country});

      // Get or create a profile
      const profile =
        await this[`${userType}Repository`].findOne({where: {uniqueId: uniqueId}}) ??
        await createProfile({userType, uniqueId, additionalInfo});

      // Check birthday
      const datesCompare: boolean = compareDates(profile.birthday, birthday);
      if (!datesCompare) throw new HttpErrors[400]('Birthday incorrect');

      // Check if profile has already added in some user
      const userWithSameProfile = await this.userRepository.findOne({where: {[`${userType}`]: profile._id}});
      if (userWithSameProfile) throw new HttpErrors[400](`The unique id is already being used by ${hideEmailString(userWithSameProfile.email as string)}`);

      // Create user
      const user = await this.userRepository.create({
        googleId: tokenDecoded.googleId,
        appleId: tokenDecoded.appleId,
        email: tokenDecoded.email,
      });
      /**
       * Create permission
       */
      if (tokenDecoded.permissionId)
        await this.userHasPermissionsRepository.create({userId: user._id, permissionId: tokenDecoded.permissionId});

      // Relate user to profile and update additional info
      await this[`${userType}Repository`].updateById(profile._id as string,
        {
          ...(additionalInfo ? (additionalInfo as AdditionalInfoModel)[`${userType}Info`] : {}),
          userId: user?._id as string,
        }
      );

      // Get user info and create new auth token
      const userCreated = await this.userService.getUserWithPermissions({
        condition: {where: {_id: user?._id as string}},
        projectId: tokenDecoded.projectId,
      });
      const newAuthToken = jwt.sign({id: user._id, projectId: tokenDecoded.projectId}, process.env.JWT_SECRET!, {expiresIn: '5m'});
      return {registeredUser: true, authToken: newAuthToken, user: userCreated!};

    } catch (e) {

      throw new HttpErrors[400](e.message);

    }
  }

  public async refreshToken(authToken: string, projectSecret: string): Promise<string> {
    try {
      const decoded = jwt.decode(authToken) as JwtPayload;

      const project = await this.projectRepository.findById(decoded.projectId);
      if (!project) throw new Error('Project not found!');
      if (project.secret !== projectSecret) throw new Error('Project secret incorrect');

      const token = jwt.sign({
        id: decoded.id,
        projectId: decoded.projectId,
      }, process.env.JWT_SECRET!, {expiresIn: '5m'});
      return token;

    } catch (e) {

      throw new HttpErrors[400](e.message)

    }
  }
}
