import {BindingScope, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {google} from 'googleapis';
import jwt, {JwtPayload} from 'jsonwebtoken';
import {CompanyDTO} from '../dto/company.dto';
import {Company, Person} from '../models';
import {AdditionalInfoModel} from '../models/signup.model';
import {PersonRepository, ProjectRepository, UserRepository} from '../repositories';
import {compareDates} from '../utils/date-manipulation-functions';
import {getUserType, userTypes} from '../utils/general-functions';
import {hideEmailString} from '../utils/string-manipulation-functions';
import {PersonDTO} from './../dto/person.dto';
import {CompanyRepository} from './../repositories/company.repository';
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
    // Services
    @service(UserService)
    private useService: UserService,
  ) { }

  googleOAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.SERVER_ROOT_URI}:${process.env.PORT}/auth/google`
  );

  /*
   * Add service methods here
   */
  public async getGoogleAuthURL(project: string, inviteToken?: string): Promise<string> {
    const url = this.googleOAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope:
        [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ],
      state: `project=${project}&inviteToken=${inviteToken}`,
    });
    return url;
  }

  public async getGoogleAuthenticatedUser(code: string): Promise<ISsoUser> {
    const {tokens} = await this.googleOAuth2Client.getToken(code);
    this.googleOAuth2Client.setCredentials(tokens);
    let oauth2 = google.oauth2({version: 'v2', auth: this.googleOAuth2Client});
    const googleUser = await oauth2.userinfo.v2.me.get();
    return {
      googleId: googleUser.data.id as string,
      email: googleUser.data.email as string,
    };
  }

  public async getTokenToAuthenticateUser(ssoUser: ISsoUser, projectId: string, inviteId?: string): Promise<string> {
    let registeredUser = await this.userRepository.findOne({where: {email: ssoUser.email}});
    if (!registeredUser) registeredUser = await this.userRepository.create(ssoUser);
    const token = jwt.sign({
      id: registeredUser._id,
      projectId,
      inviteId,
    }, process.env.JWT_SECRET!, {expiresIn: '5m'});
    return token;
  }

  public async getUser(authToken: string): Promise<ISumaryUser> {
    try {
      const tokenDecoded = jwt.verify(authToken, process.env.JWT_SECRET!) as JwtPayload;
      const user = await this.userRepository.findById(tokenDecoded.id);
      if (!user.personId && !user.companyId) throw new HttpErrors[404]('User not registered');
      const userType = user.personId ? 'person' : 'company';
      const profileInfo = await this[`${userType}Repository`].findById(user.personId || user.companyId);
      return {
        userId: user._id!,
        [`${userType}Info`]: profileInfo as ISumaryPerson | ISumaryCompany,
      };
    } catch (e) {
      throw new HttpErrors[400](e.message);
    }
  }

  public async createUser(
    {authToken, uniqueId, birthday, country, additionalInfo}:
      {authToken: string, uniqueId: string, birthday: Date, country: string, additionalInfo?: AdditionalInfoModel}
  ): Promise<ISumaryUser> {
    try {
      const tokenDecoded = jwt.verify(authToken, process.env.JWT_SECRET!) as JwtPayload;
      // Get user type and profile (person or company)
      const userType = getUserType({uniqueId, country});
      // Get or create a profile
      const profile =
        await this[`${userType}Repository`].findOne({where: {uniqueId: uniqueId}}) ??
        await this.createProfile({userType, uniqueId, additionalInfo});
      // Update profile with additional info
      if (additionalInfo)
        await this[`${userType}Repository`].updateById(profile._id as string, {...(additionalInfo as AdditionalInfoModel)[`${userType}Info`]});
      // Check birthday
      const datesCompare: boolean = compareDates(profile.birthday, birthday);
      if (!datesCompare) throw new HttpErrors[400]('Birthday incorrect');
      // Check if profile has already added in some user
      const userWithSameProfile = await this.userRepository.findOne({where: {[`${userType}Id`]: profile._id}});
      if (userWithSameProfile) throw new HttpErrors[400](`The unique id is already being used by ${hideEmailString(userWithSameProfile.email as string)}`);
      // Put profile, project and invite in user
      const user = await this.useService.updateUser({
        userType,
        profileId: profile._id as string,
        id: tokenDecoded.id,
        projectIds: [tokenDecoded.projectId],
        inviteIds: [tokenDecoded.inviteId],
      });
      return {
        userId: user._id as string,
        [`${userType}Info`]: profile,
      }
    } catch (e) {
      throw new HttpErrors[400](e.message);
    }
  }

  private async createProfile(
    {userType, uniqueId, additionalInfo}: {userType: userTypes, uniqueId: string, additionalInfo?: AdditionalInfoModel}
  ): Promise<Person | Company> {
    const apiResponse = await fetch(`${process.env.API_CPF_CNPJ}/${userType === 'person' ? 2 : 6}/${uniqueId.replace(/\D/g, "")}`);
    const dataFromApi: IPersonFromAPI | ICompanyFromAPI = await apiResponse.json();
    const profileDTO: PersonDTO | CompanyDTO =
      userType === 'person' ?
        new PersonDTO({dataFromApi: dataFromApi as IPersonFromAPI, additionalInfo: additionalInfo as AdditionalInfoModel}) :
        new CompanyDTO({dataFromApi: dataFromApi as ICompanyFromAPI, additionalInfo: additionalInfo as AdditionalInfoModel});
    const profileCreated = await this[`${userType}Repository`].create({...profileDTO});
    return profileCreated;
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
        inviteId: decoded.inviteId,
      }, process.env.JWT_SECRET!, {expiresIn: '5m'});
      return token;
    } catch (e) {
      throw new HttpErrors[400](e.message)
    }
  }
}
