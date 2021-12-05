import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import querystring from 'query-string';
import {PersonRepository, UserRepository} from '../repositories';

const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    /* Add @inject to inject parameters */

    @repository(UserRepository)
    private userRepository: UserRepository,

    @repository(PersonRepository)
    private personRepository: PersonRepository,
  ) { }

  /*
   * Add service methods here
   */
  public async authenticateUser(ssoId: string, sso: string, acl: string, uniqueId?: string, birthday?: string): Promise<string> {

    switch (sso) {
      case 'google':
        return this.googleAuthentication(ssoId, sso, acl, uniqueId, birthday);

      case 'apple':
        return this.appleAuthentication(ssoId, sso, acl, uniqueId, birthday);

      default:
        throw new HttpErrors[400]('SSO not recognized');
    }
  }

  private async googleAuthentication(ssoId: string, sso: string, acl: string, uniqueId?: string, birthday?: string): Promise<string> {

    // Search for user
    var user = await this.userRepository.findOne({where: {googleId: ssoId}});

    // If user doesnt exist, create one
    if (!user) user = await this.createUser(ssoId, sso, uniqueId, birthday, acl);

    // Create token
    const token = await this.createToken({userId: user?._id, sso: 'google'}, 30);

    return token;
  }

  private async appleAuthentication(ssoId: string, sso: string, acl: string, uniqueId?: string, birthday?: string): Promise<string> {

    // Search for user
    var user = await this.userRepository.findOne({where: {appleId: ssoId}});

    // If user doesnt exist, create one
    if (!user) user = await this.createUser(ssoId, sso, uniqueId, birthday, acl);

    // Create token
    const token = await this.createToken({userId: user?._id, sso: 'apple'}, 30);

    return token;
  }

  private async createUser(ssoId: string, sso: string, uniqueId?: string, birthday?: string, acl?: string): Promise<any> {

    try {

      var newUser = {};

      // Search person
      var person = await this.personRepository.findOne({where: {uniqueId: uniqueId}});

      // Create person if doesnt exists
      if (!person) {

        // Get person info in CPF/CNPJ API
        const response = await fetch(`${process.env.API_CPF_CNPJ}/${uniqueId}`);
        const personFromAPI = await response.json();

        // Check birthday
        if (personFromAPI.nascimento !== birthday)
          throw new HttpErrors[400]('Birthday incorrect');

        // Create person
        person = await this.personRepository.create({
          name: personFromAPI.nome,
          uniqueId: personFromAPI.cpf.replace(/\D/g, ""),
          birthday: personFromAPI.nascimento,
          gender: personFromAPI.genero,
          mother: personFromAPI.mae,
          country: 'br'
        });

      } else {
        // Check birthday
        if (person.birthday !== birthday)
          throw new HttpErrors[400]('Birthday incorrect');
      }

      // Add personId and ACL
      newUser = {
        personId: person?._id,
        acl: acl,
      };

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

  private async createToken(payload: object, expiresIn?: any): Promise<string> {

    let token = await jwt.sign(payload, process.env.JWT_SECRET as string, {expiresIn: expiresIn});

    return token;
  }

  // Get google login url
  public async getGoogleAuthURL(redirectURI: string, acl: string): Promise<string> {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: `${process.env.SERVER_ROOT_URI}:${process.env.PORT}/${redirectURI}`,
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      state: acl,
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
  public async authenticateGoogleUser(redirectURI: string, code: string, acl: string): Promise<any> {
    const {id_token, access_token} = await this.getTokens({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: `${process.env.SERVER_ROOT_URI}:${process.env.PORT}/${redirectURI}`,
    });

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

    if (!user)
      return {
        ssoId: googleUser.id,
        signup: true,
        acl,
      }

    // Create token
    const token = await this.createToken({userId: user?._id}, 30);

    return {
      redirectUri: `${process.env.UI_SPLASH_URI}?token=${token}`,
      signup: false,
    }
  }
}
