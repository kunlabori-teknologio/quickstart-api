import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {google} from 'googleapis';
import jwt, {JwtPayload} from 'jsonwebtoken';
import {InviteRepository, PersonRepository, ProjectRepository, UserRepository} from '../repositories';
import {compareDates} from '../utils/date-manipulation-functions';
import {checkIfPersonOrCompanyUniqueId} from '../utils/general-functions';
import {hideEmailString} from '../utils/string-manipulation-functions';
import {PersonDTO} from './../dto/person.dto';
import {CompanyRepository} from './../repositories/company.repository';

const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    /* Add @inject to inject parameters */
    @repository(UserRepository)
    private userRepository: UserRepository,
    @repository(PersonRepository)
    private personRepository: PersonRepository,
    @repository(CompanyRepository)
    private companyRepository: CompanyRepository,
    @repository(InviteRepository)
    private inviteRepository: InviteRepository,
    @repository(ProjectRepository)
    private projectRepository: ProjectRepository,
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

  public async getGoogleAuthenticatedUser(code: string): Promise<SsoUser> {
    const {tokens} = await this.googleOAuth2Client.getToken(code);
    this.googleOAuth2Client.setCredentials(tokens);
    let oauth2 = google.oauth2({version: 'v2', auth: this.googleOAuth2Client});
    const googleUser = await oauth2.userinfo.v2.me.get();
    return {
      googleId: googleUser.data.id as string,
      email: googleUser.data.email as string,
    };
  }

  public async getTokenToAuthenticateUser(ssoUser: SsoUser, projectId: string, inviteId?: string): Promise<string> {
    let registeredUser = await this.userRepository.findOne({where: {email: ssoUser.email}});
    if (!registeredUser) registeredUser = await this.userRepository.create(ssoUser);
    const token = jwt.sign({
      id: registeredUser._id,
      projectId,
      inviteId,
    }, process.env.JWT_SECRET!, {expiresIn: '5m'});
    return token;
  }

  public async getUser(authToken: string): Promise<SumaryUser> {
    try {
      const tokenDecoded = jwt.verify(authToken, process.env.JWT_SECRET!) as JwtPayload;
      const user = await this.userRepository.findById(tokenDecoded.id);
      if (!user.personId) throw new HttpErrors[404]('User not registered');
      const personInfo = await this.personRepository.findById(user.personId);
      return {
        userId: user._id!,
        personInfo: personInfo as SumaryPerson,
      };
    } catch (e) {
      throw new HttpErrors[400](e.message);
    }
  }

  public async createUser(authToken: string, uniqueId: string, birthday: Date): Promise<SumaryUser> {
    try {
      const tokenDecoded = jwt.verify(authToken, process.env.JWT_SECRET!) as JwtPayload;
      const userType = checkIfPersonOrCompanyUniqueId(uniqueId, 'br');
      let profile = userType === 'person' ?
        await this.personRepository.findOne({where: {uniqueId: uniqueId}}) :
        await this.companyRepository.findOne({where: {uniqueId: uniqueId}});
      if (!profile) {
        // Get person/company info in CPF/CNPJ API
        const response = await fetch(`${process.env.API_CPF_CNPJ}/${userType === 'person' ? 2 : 6}/${uniqueId}`);
        const personCompanyFromAPI: IPersonFromAPI = await response.json();
        // Create person
        const profileDTO: PersonDTO = new PersonDTO(personCompanyFromAPI);
        profile = await this.personRepository.create(profileDTO);
        // Check birthday
        const datesCompare: boolean = compareDates(profileDTO.birthday, birthday as Date);
        if (!datesCompare) throw new HttpErrors[400]('Birthday incorrect');
      } else {
        // Check birthday
        const datesCompare = await compareDates(profile.birthday, birthday as Date);
        if (!datesCompare) throw new HttpErrors[400]('Birthday incorrect');
        // Checks if person has already been added to a user
        const userFound = await this.userRepository.findOne({where: {personId: profile._id}});
        if (userFound) throw new HttpErrors[400](`The unique id has already been used in ${hideEmailString(userFound.email!)} account!`);
      }
      // Create user
      const projects = [{'id': tokenDecoded.projectId}];
      let inviters = [];
      if (tokenDecoded.inviteId) {
        const invite = await this.inviteRepository.findById(tokenDecoded.inviteId);
        inviters.push({
          inviterId: invite._id,
          projectId: tokenDecoded.projectId,
          invitedAt: invite._createdAt,
        });
      }
      await this.userRepository.updateById(tokenDecoded.id, {personId: profile._id, projects, inviters});
      return {
        userId: tokenDecoded.id,
        personInfo: profile as SumaryPerson,
      }
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
        inviteId: decoded.inviteId,
      }, process.env.JWT_SECRET!, {expiresIn: '5m'});
      return token;
    } catch (e) {
      throw new HttpErrors[400](e.message)
    }
  }
}
