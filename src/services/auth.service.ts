import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import querystring from 'query-string';
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

  /*
   * Add service methods here
   */
  public async authenticateUser(ssoId: string, sso: string, project: string, uniqueId?: string, birthday?: Date, invite?: any): Promise<string> {

    switch (sso) {
      case 'google':
        return this.googleAuthentication(ssoId, sso, project, uniqueId, birthday, invite);

      case 'apple':
        return this.appleAuthentication(ssoId, sso, project, uniqueId, birthday, invite);

      default:
        throw new HttpErrors[400]('SSO not recognized');
    }
  }

  private async googleAuthentication(ssoId: string, sso: string, project: string, uniqueId?: string, birthday?: Date, invite?: any): Promise<string> {

    // Search for user
    var user = await this.userRepository.findOne({where: {googleId: ssoId}});

    // If user doesnt exist, create one
    if (!user) user = await this.createUser(ssoId, sso, project, uniqueId, birthday, invite);

    // Get project secret
    const projectInfo = await this.projectRepository.findById(project);

    // Create token
    const token = await this.createToken({userId: user?._id, projectId: project, sso: 'google'}, projectInfo?.secret, 30);

    return token;
  }

  private async appleAuthentication(ssoId: string, sso: string, project: string, uniqueId?: string, birthday?: Date, invite?: any): Promise<string> {

    // Search for user
    var user = await this.userRepository.findOne({where: {appleId: ssoId}});

    // If user doesnt exist, create one
    if (!user) user = await this.createUser(ssoId, sso, project, uniqueId, birthday, invite);

    // Get project secret
    const projectInfo = await this.projectRepository.findById(project);

    // Create token
    const token = await this.createToken({userId: user?._id, projectId: project, sso: 'apple'}, projectInfo?.secret, 30);

    return token;
  }

  private async createUser(ssoId: string, sso: string, project: string, uniqueId?: string, birthday?: Date, invite?: any): Promise<any> {

    try {

      var newUser = {};

      // Search person
      var person = await this.personRepository.findOne({where: {uniqueId: uniqueId}});

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
      }

      // Add personId and ACL
      newUser = {
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

  // Google functions
  // Get google login url
  public async getGoogleAuthURL(redirectURI: string, project: string, inviteToken?: string): Promise<string> {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: `${process.env.SERVER_ROOT_URI}:${process.env.PORT}/${redirectURI}`,
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      state: `project=${project}&inviteToken=${inviteToken}`,
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    return `${rootUrl}?${querystring.stringify(options)}`;
  }

  // Get google tokens
  private async getTokens({
    code,
    clientId,
    clientSecret,
    redirectUri,
  }: {
    code: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }): Promise<{
    access_token: string;
    expires_in: Number;
    refresh_token: string;
    scope: string;
    id_token: string;
    state: string;
  }> {
    /*
     * Uses the code to get tokens
     * that can be used to fetch the user's profile
     */
    const url = "https://oauth2.googleapis.com/token";
    const values = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };

    return axios
      .post(url, querystring.stringify(values), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((res) => {
        return res.data
      })
      .catch((error) => {
        console.error(`Failed to fetch auth tokens`);
        throw new Error(error.message);
      });
  }

  // Authenticate user with google
  public async authenticateGoogleUser(redirectURI: string, code: string, state: string): Promise<any> {
    const {id_token, access_token} = await this.getTokens({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: `${process.env.SERVER_ROOT_URI}:${process.env.PORT}/${redirectURI}`,
    });

    // Get projectId
    const projectId = state.split('&')[0].substring(8);
    const inviteToken = state.split('&')[1].substring(12);

    // Fetch the user's profile with the access token and bearer
    const googleUser = await axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      )
      .then((res) => res.data)
      .catch((error) => {
        console.error(`Failed to fetch user`);
        throw new Error(error.message);
      });

    // Search for user
    var user = await this.userRepository.findOne({where: {googleId: googleUser.id}});

    if (!user) {
      // Get invite permissions
      let inviteInfo = {};
      if (inviteToken && inviteToken !== 'undefined') {
        let invite = await this.verifyToken(inviteToken, process.env.JWT_SECRET as string);
        inviteInfo = {
          inviterId: invite.inviterId,
          permissions: invite.permissions,
          invitedAt: invite.invitedAt,
          projectId: projectId,
        }
      }

      return {
        ssoId: googleUser.id,
        signup: true,
        project: projectId,
        inviteInfo: JSON.stringify(inviteInfo),
      }
    } else if (inviteToken && inviteToken !== 'undefined') {

    }

    // TODO: verify if user authorized project

    // Get project secret
    const projectInfo = await this.projectRepository.findById(projectId);

    // Create token
    const token = await this.createToken({userId: user?._id, projectId: projectId}, projectInfo?.secret, 30);

    return {
      redirectUri: `${process.env.UI_SPLASH_URI}/${token}`,
      signup: false,
    }
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
