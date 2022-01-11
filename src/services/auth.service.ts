import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {google} from 'googleapis';
import jwt from 'jsonwebtoken';
import {URLSearchParams} from 'url';
import {PersonRepository, ProjectRepository, UserRepository} from '../repositories';
import {PermissionRepository} from './../repositories/permission.repository';

const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    /* Add @inject to inject parameters */

    @repository(UserRepository)
    private userRepository: UserRepository,

    @repository(PersonRepository)
    private personRepository: PersonRepository,

    @repository(ProjectRepository)
    private projectRepository: ProjectRepository,

    @repository(PermissionRepository)
    private permissionRepository: PermissionRepository,
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
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      state: `project=${project}&inviteToken=${inviteToken}`,
    });

    return url;
  }

  public async getGoogleAuthenticatedUser(code: string, state: string): Promise<any> {

    const {tokens} = await this.googleOAuth2Client.getToken(code);
    this.googleOAuth2Client.setCredentials(tokens);

    let oauth2 = google.oauth2({version: 'v2', auth: this.googleOAuth2Client});
    const googleUser = await oauth2.userinfo.v2.me.get();

    // Get projectId and invite token
    const params = new URLSearchParams(state);
    const projectId = params.get('project');
    const inviteToken = params.get('inviteToken');

    // Search for user
    let user = await this.userRepository.findOne({where: {googleId: googleUser.data.id as string}});

    if (!user) {
      // Get invite permissions
      let inviteInfo = {};
      if (inviteToken) {
        let invite = await this.verifyToken(inviteToken, process.env.JWT_SECRET as string);
        inviteInfo = {
          inviterId: invite.inviterId,
          permissions: invite.permissions,
          invitedAt: invite.invitedAt,
          projectId: projectId,
        }
      }

      return {
        ssoId: googleUser.data.id,
        email: googleUser.data.email,
        signup: true,
        project: projectId,
        inviteInfo: JSON.stringify(inviteInfo),
      }
    }

    // TODO: verify if user authorized project

    // Get project secret
    const projectInfo = await this.projectRepository.findById(projectId as string);

    // Create token
    const token = await this.createToken({userId: user?._id, projectId: projectId}, projectInfo?.secret, 30);

    return {
      redirectUri: `${process.env.UI_SPLASH_URI}/${token}`,
      signup: false,
    }
  }

  public async authenticateUser(ssoId: string, sso: string, email: string, project: string, uniqueId?: string, birthday?: Date, invite?: any): Promise<string> {

    switch (sso) {
      case 'google':
        return this.googleAuthentication(ssoId, sso, email, project, uniqueId, birthday, invite);

      case 'apple':
        return this.appleAuthentication(ssoId, sso, email, project, uniqueId, birthday, invite);

      default:
        throw new HttpErrors[400]('SSO not recognized');
    }
  }

  private async googleAuthentication(ssoId: string, sso: string, email: string, project: string, uniqueId?: string, birthday?: Date, invite?: any): Promise<string> {

    // Search for user
    let user = await this.userRepository.findOne({where: {googleId: ssoId}});

    // If user doesnt exist, create one
    if (!user) user = await this.createUser(ssoId, sso, email, project, uniqueId, birthday, invite);

    // Get project secret
    const projectInfo = await this.projectRepository.findById(project);

    // Create token
    const token = await this.createToken({userId: user?._id, projectId: project, sso: 'google'}, projectInfo?.secret, 30);

    return token;
  }

  private async appleAuthentication(ssoId: string, sso: string, email: string, project: string, uniqueId?: string, birthday?: Date, invite?: any): Promise<string> {

    // Search for user
    let user = await this.userRepository.findOne({where: {appleId: ssoId}});

    // If user doesnt exist, create one
    if (!user) user = await this.createUser(ssoId, sso, email, project, uniqueId, birthday, invite);

    // Get project secret
    const projectInfo = await this.projectRepository.findById(project);

    // Create token
    const token = await this.createToken({userId: user?._id, projectId: project, sso: 'apple'}, projectInfo?.secret, 30);

    return token;
  }

  private async createUser(ssoId: string, sso: string, email: string, project: string, uniqueId?: string, birthday?: Date, invite?: any): Promise<any> {

    try {

      let newUser = {};

      // Search person
      let person = await this.personRepository.findOne({where: {uniqueId: uniqueId}});

      // Create person if doesnt exists
      if (!person) {

        // Get person info in CPF/CNPJ API
        const response = await fetch(`${process.env.API_CPF_CNPJ}/${uniqueId}`);
        const personFromAPI = await response.json();

        const birthdayAPI = await this.convertBirthdayStringToDate(personFromAPI.nascimento);

        // Create person
        person = await this.personRepository.create({
          name: personFromAPI.nome,
          uniqueId: personFromAPI.cpf.replace(/\D/g, ""),
          birthday: birthdayAPI,
          gender: personFromAPI.genero,
          mother: personFromAPI.mae,
          country: 'br'
        });

        // Check birthday
        const datesCompare = await this.compareDates(birthdayAPI, birthday as Date);
        if (!datesCompare)
          throw new HttpErrors[400]('Birthday incorrect');

      } else {
        const datesCompare = await this.compareDates(person.birthday, birthday as Date);
        // Check birthday
        if (!datesCompare)
          throw new HttpErrors[400]('Birthday incorrect');

        // Checks if person has already been added to a user
        const userFound = await this.userRepository.findOne({where: {personId: person._id}});
        if (userFound) throw new HttpErrors[400](`Person has already been added to a user - ${userFound.email}`);
      }

      // Add personId and ACL
      newUser = {
        email: email,
        personId: person?._id,
        projects: [
          {
            'id': project
          }
        ],
      };

      // Add invite info
      if (Object.keys(invite).length) {
        newUser = {
          ...newUser,
          inviters: [
            {
              inviterId: invite.inviterId,
              projectId: invite.projectId,
              invitedAt: invite.invitedAt,
            }
          ]
        }
      }

      switch (sso) {
        case 'google':
          newUser = {...newUser, googleId: ssoId};
          break;

        case 'apple':
          newUser = {...newUser, appleId: ssoId};
          break;

        default:
          break;
      }

      const userCreated = this.userRepository.create(newUser);

      return userCreated;
    } catch (e) {
      throw new HttpErrors[400](e.message);
    }
  }

  public async createToken(payload: object, secret: string, expiresIn?: any): Promise<string> {

    let token = await jwt.sign(payload, secret, {expiresIn: expiresIn});

    return token;
  }

  public async verifyToken(token: string, secret: string): Promise<any> {

    try {
      const decoded = await jwt.verify(token, secret);
      return decoded;
    } catch (e) {
      throw new HttpErrors[400](e.message);
    }

  }

  public async getTokenPayload(token: string): Promise<any> {
    try {
      const decoded = await jwt.decode(token);
      return decoded;
    } catch (e) {
      throw new HttpErrors[400](e.message);
    }
  }

  public async checkProjectAndSecret(projectId: string, projectSecret: string): Promise<boolean> {
    const project = await this.projectRepository.findOne({where: {_id: projectId}});
    if (project && project.secret === projectSecret) return true;
    return false;
  }

  private async convertBirthdayStringToDate(birthday: string): Promise<Date> {
    const dateSplited = birthday.split('/');
    const dateString = `${dateSplited[1]}/${dateSplited[0]}/${dateSplited[2]}`;
    const date = new Date(dateString);
    return date;
  }

  private async compareDates(date1: Date, date2: Date): Promise<boolean> {
    const date1WithoutTime = new Date(date1).setHours(0, 0, 0, 0);
    const date2WithoutTime = new Date(date2).setHours(0, 0, 0, 0);

    return date1WithoutTime === date2WithoutTime;
  }

  public async getCreatedBy(authToken: string): Promise<string> {
    const tokenArray = authToken.split(' ');
    const token = tokenArray[1];
    const tokenPayload = await this.getTokenPayload(token);
    return tokenPayload.userId;
  }

  public async verifyAuthorization(module: string, aclAction: string, authToken: string): Promise<void> {
    try {
      const tokenArray = authToken.split(' ');
      const token = tokenArray[1];
      const tokenPayload = await this.getTokenPayload(token);

      const permissions = await this.permissionRepository.find();
      const userPermissions = permissions.filter(el => el.users?.includes(tokenPayload.userId));

      for (let permissionIndex = 0; permissionIndex < userPermissions.length; permissionIndex++) {
        const permission = userPermissions[permissionIndex];
        for (let aclIndex = 0; aclIndex < permission.acl.length; aclIndex++) {
          const acl = permission.acl[aclIndex];
          if (acl.module === module && acl.aclActions.includes(aclAction)) return;
        }
      }

      throw new Error('user has not authorization to access this module');
    } catch (e) {
      throw new HttpErrors[401](`Unauthorized: ${e.message}`)
    }
  }
}
